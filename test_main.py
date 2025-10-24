import pytest
from fastapi.testclient import TestClient
from main import app, ChatRequest, ResumeTailorRequest

# Create a client that can be used in all our tests
client = TestClient(app)

# Fixture for sample job data
@pytest.fixture
def sample_job_data():
    """
    A fixture that provides a sample resume and job description
    for testing the /resume-tailor endpoint.
    """
    return {
        "base_resume": "I am a software engineer.",
        "job_description": "We need a Python developer."
    }

def test_client_is_working():
    """
    A simple "sanity check" test to make sure the client is working.
    We don't have a "/" route, so we expect a 404 "Not Found" error.
    """
    response = client.get("/")
    assert response.status_code == 404


def test_chat_endpoint(mocker):
  """
  Tests the /chat endpoint.
  It uses 'mocker' to fake the external AI and Database calls.
  """
  # Create a fake response object
  class MockGeminiResponse:
    text = 'This is a fake AI response.'

  # Replace the real 'genai.Client'
  mock_gemini_client = mocker.patch("main.genai.Client")

  # Tell the fake client what to do when 'generate_content' is called
  mock_gemini_client.return_value.models.generate_content.return_value = MockGeminiResponse()

    # Create a fake document reference
  class MockDocRef:
    id = "fake_doc_id_123"

  # Replace the real 'db.collection'
  mock_db_collection = mocker.patch("main.db.collection")
    
  # Tell the fake collection what to do when 'add' is called
  mock_db_collection.return_value.add.return_value = (None, MockDocRef())

  # This is the data we'll send to our endpoint
  test_message = {"message": "Hello, AI!"}

  # Call the /chat endpoint using the test client
  response = client.post("/chat", json=test_message)

  # 4. --- CHECK THE RESULTS ---
  assert response.status_code == 200
  
  assert response.json() == {"response": "This is a fake AI response."}
  
  # Check that our mocks were called as expected
  mock_db_collection.return_value.add.assert_called_once()


def test_fixture_is_working(sample_job_data):
    """
    This is a simple test to show how to use the fixture.
    It "requests" the fixture by name as an argument.
    """
    print(f"Fixture provided data: {sample_job_data}")
    assert "base_resume" in sample_job_data
    assert sample_job_data["job_description"] == "We need a Python developer."