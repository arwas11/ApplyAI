import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(autouse=True)
def mock_firebase(mocker):
    """
    Fixture to mock Firebase/Firestore before any tests run.
    The autouse=True means this runs automatically for all tests.
    """

    # Create the Mock DB Client
    class MockDocRef:
        id = "fake_doc_id_123"

    mock_db_client = mocker.Mock()
    # Ensure nested calls like db.collection().add() return valid mocks
    mock_db_client.collection.return_value.add.return_value = (None, MockDocRef())
    # mock_db_client.collection.return_value.document.return_value = mocker.Mock()

    # Patch the External Firebase Calls (so they don't hit the network)
    mocker.patch("firebase_admin.credentials.Certificate")
    mocker.patch("firebase_admin.initialize_app")
    mocker.patch("firebase_admin.firestore.client", return_value=mock_db_client)

    # Patch the global db variable
    import main

    # Overwrite the 'db' variable inside the 'main' module
    main.db = mock_db_client

    yield

    # 4. Clean up
    main.db = None


@pytest.fixture
def client():
    """
    Creates a fresh client for each test and triggers the lifespan
    """

    with TestClient(app) as c:
        yield c


# Fixture for sample job data
@pytest.fixture
def sample_job_data():
    """
    A fixture that provides a sample resume and job description
    for testing the /resumes endpoint.
    """
    return {
        "base_resume": "I am a software engineer.",
        "job_description": "We need a Python developer.",
    }


def test_client_is_working(client):
    """
    A simple "sanity check" test to make sure the client is working.
    We don't have a "/" route, so we expect a 404 "Not Found" error.
    """
    response = client.get("/")
    assert response.status_code == 404


def test_chat_endpoint(client, mocker):
    """
    Tests the /chat endpoint.
    It uses 'mocker' to fake the Gemini AI call.
    Firebase/Firestore is already mocked by the mock_firebase fixture.
    """

    # --- ARRANGE (Mocks) ---
    # Mock Gemini
    class MockGeminiResponse:
        text = "This is a fake AI response."

    mock_gemini_client = mocker.patch("google.genai.Client")
    mock_gemini_client.return_value.models.generate_content.return_value = (
        MockGeminiResponse()
    )

    # --- ACT ---
    test_message = {"message": "Hello, AI!"}

    # NOW, when we call client.post(), the lifespan runs...
    # ...it calls the *mocked* firestore.client()...
    # ...and our global 'db' variable in main.py gets set to our 'mock_db_client'.
    response = client.post("/chat", json=test_message)

    # --- ASSERT ---
    assert response.status_code == 200
    assert response.json() == {"response": "This is a fake AI response."}

    # Verify that Gemini was called as expected
    mock_gemini_client.return_value.models.generate_content.assert_called_once()


def test_resume_tailor_endpoint(client, sample_job_data, mocker):
    """
    Tests the /resumes endpoint.

    - Mocks the external Gemini API call.
    - Uses the 'sample_job_data' fixture to send form data.
    - Asserts that the status code is 200.
    - Asserts that the correct JSON response is returned.
    """

    # Define a fake response object for the AI
    class MockGeminiResponse:
        text = "This is a fake tailored resume."

    # Patch the genai.Client in the 'main' module
    mock_gemini_client = mocker.patch("google.genai.Client")

    # Tell the mock client what to return when generate_content is called
    mock_gemini_client.return_value.models.generate_content.return_value = (
        MockGeminiResponse()
    )

    # Make the API call using the test client
    # We use 'data=' because the endpoint expects Form Data
    response = client.post(
        "/resumes",
        data={
            "base_resume": sample_job_data["base_resume"],
            "job_description": sample_job_data["job_description"],
        },
    )

    assert response.status_code == 200
    assert response.json().get("tailored_resume") == "This is a fake tailored resume."


def test_fixture_is_working(sample_job_data):
    """
    This is a simple test to show how to use the fixture.
    It "requests" the fixture by name as an argument.
    """
    print(f"Fixture provided data: {sample_job_data}")
    assert "base_resume" in sample_job_data
    assert sample_job_data["job_description"] == "We need a Python developer."
