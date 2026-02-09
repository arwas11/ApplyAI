import datetime
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from typing import List

from utils import log_time_decorator
from models import (
    ChatRequest,
    ChatResponse,
    ResumeTailorResponse,
    ChatSessionResponse,
    ResumeSessionResponse,
)

from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
from google import genai


# --- Define db as None at the top level ---
# It will be populated by the lifespan event
db = None


# --- LIFESPAN EVENT HANDLER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    """
    global db  # Make 'db' available to the whole module

    # --- 1. Load .env file with absolute path ---
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(BASE_DIR, ".env")
    load_dotenv(dotenv_path=dotenv_path)

    if not os.getenv("GEMINI_API_KEY"):
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    # --- 2. Make the credential path absolute ---
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not cred_path:
        raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not found in .env")

    # If the path in .env is relative, make it absolute (relative to main.py)
    if not os.path.isabs(cred_path):
        cred_path = os.path.join(BASE_DIR, cred_path)

    # Check if the file *actually* exists before trying to use it
    if not os.path.exists(cred_path):
        raise FileNotFoundError(f"Credential file not found. Looked at: {cred_path}")

    # --- 3. Initialize Firebase with the guaranteed absolute path ---
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client(database_id="applyai")
    print("--- FastAPI app started, Firebase Initialized ---")

    yield  # This is the point where the app is "running"

    # --- Code to run ON SHUTDOWN ---
    print("--- FastAPI app shutting down ---")


# --- Initialize FastAPI app WITH the new lifespan event ---
app = FastAPI(lifespan=lifespan)

# Define the "origins" (websites) that are allowed to talk to the API
origins = [
    "http://localhost:3000",  # local frontend
    # "https://prod-frontend-url.com" # We'll add this later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Allow cookies (if we use them later)
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Endpoints ---
# --- Post Chat Endpoint ---
@app.post(
    "/chat", response_model=ChatResponse, summary="Handles Chat with Gemini AI Agent"
)
@log_time_decorator
async def chat_with_agent(request: ChatRequest):
    """
    Endpoint to chat with the Gemini AI agent.
    This endpoint takes a user's message, gets a response from the AI,
    and saves the conversation to Firestore.

    Args:
        request (ChatRequest): The request body containing the user's message.

    Returns:
        ChatResponse: The AI's response to the user's message.
    """

    try:
        user_message = request.message
        uid = request.user_id if request.user_id else None

        # Create a single client object
        client = genai.Client()

        # Send the message to the model
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
        )
        # Extract the AI's reply from the response
        ai_reply = response.text

        # Only save to DB if we have a real user
        if uid and db:
            chat_data = {
                "user_id": uid,
                "messages": [
                    {"role": "user", "content": user_message},
                    {"role": "ai", "content": ai_reply},
                ],
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
            # Capture the return value
            doc_ref = db.collection("chats").add(chat_data)

            print(f"Saved chat with ID: {doc_ref[1].id}")

        # 4. Return the model's response
        return ChatResponse(response=response.text)

    except Exception as e:
        print(f"An error occured: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to get response from AI model"
        )


# --- Post Resumes Endpoint ---
@app.post(
    "/resumes",
    response_model=ResumeTailorResponse,
    summary="Generates a tailored resume",
)
@log_time_decorator
async def generate_resume(
    base_resume: str = Form(), job_description: str = Form(), user_id: str = Form()
):
    """
    Endpoint to tailor a resume for a specific job description using Gemini AI.
    This endpoint accepts form data, making it easy to paste multi-line text.

    Args:
        base_resume (str): The user's full, unformatted base resume text.
        job_description (str): The full, unformatted job description text.

    Returns:
        ResumeTailorResponse: The tailored resume.
    """

    # This is the core logic: the prompt.
    # We're telling the AI to act as a career coach and rewrite the resume.
    prompt = f"""
    Act as an expert technical recruiter and career coach. Your task is to rewrite the following resume to be perfectly tailored for the provided job description.

    **Instructions:**
    1. Analyze the job description to identify the most important keywords, skills, and qualifications.
    2. Rewrite the professional summary and experience bullet points to highlight the candidate's skills and accomplishments that are most relevant to the job description.
    3.  Incorporate the keywords from the job description naturally into the resume.
    4.  Focus on achievements and impact, using metrics where possible. Do not invent new facts, only rephrase and emphasize existing information.
    5.  Maintain a professional and confident tone.
    6.  The output should be the full, rewritten resume in Markdown format.

    ---
    **Original Resume:**
    {base_resume}
    ---
    **Job Description:**
    {job_description}
    ---
    **Tailored Resume:**
    """
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        tailored_resume_obj = ResumeTailorResponse(tailored_resume=response.text)

        resume_record = {
            "user_id": user_id,
            "originalResume": base_resume,
            "jobDescription": job_description,
            "tailoredResume": tailored_resume_obj.tailored_resume,
            "createdAt": datetime.datetime.now(datetime.timezone.utc),
            "meta": {"modelUsed": "gemini-2.5-flash", "processingTimeMs": 1200},
        }

        # Save to Firestore
        # Note: We use 'await' if we were using an async driver, but firebase-admin is sync.
        # Ideally, we'd run this in a threadpool to not block, but for MVP this is okay.
        if db:  # Safety check if db connection failed
            doc_ref = db.collection("tailored_resumes").add(resume_record)
            print(f"Saved resume with ID: {doc_ref[1].id}")

        return tailored_resume_obj

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate resume.")


# --- Read Chats Endpoint ---
@app.get("/chats/{user_id}", response_model=List[ChatSessionResponse])
async def read_chats(user_id: str):
    try:
        # Query the collection for docs belonging to this user
        # Ew also order them by timestamp so the newest (or oldest) show up correctly
        query = (
            db.collection("chats")
            .where("user_id", "==", user_id)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
        )
        docs = query.stream()

        history = []

        for doc in docs:
            data = doc.to_dict()
            history.append(
                {
                    "id": doc.id,
                    "messages": data.get("messages", []),
                    # Handle potential missing timestamps gracefully
                    "timestamp": data.get("timestamp") or datetime.datetime.now(),
                }
            )

        return history

    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Read Resume Endpoint ---
@app.get("/resumes/{user_id}", response_model=List[ResumeSessionResponse])
async def read_resumes(user_id: str):
    try:
        query = (
            db.collection("tailored_resumes")
            .where("user_id", "==", user_id)
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
        )
        docs = query.stream()
        history = []

        for doc in docs:
            data = doc.to_dict()
            history.append(
                {
                    "id": doc.id,
                    "originalResume": data.get("originalResume", []),
                    "tailoredResume": data.get("tailoredResume", []),
                    "createdAt": data.get("createdAt") or datetime.datetime.now(),
                }
            )

        return history

    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
