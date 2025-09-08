from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from google import genai
import os

from pydantic import BaseModel

load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

app = FastAPI()

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class ResumeTailorRequest(BaseModel):
    base_resume: str
    job_description: str

class ResumeTailorResponse(BaseModel):
    tailored_resume: str


# --- API Endpoints ---
@app.post("/chat", response_model=ChatResponse, summary="Handles Chat with Gemini AI Agent")
async def chat_with_agent(request: ChatRequest):
    """
    Endpoint to chat with the Gemini AI agent.
    This endpoint takes a user's message and returns a response from the Gemini AI agent.

    Args:
        request (ChatRequest): The request body containing the user's message.

    Returns:
        ChatResponse: The response from the Gemini AI agent.
    """

    try:     
        # 1. Create a single client object
        client = genai.Client()

        # 2. Get the last user message from the request
        user_message = request.message

        # 3. Send the message to the model
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
        )

        # 4. Return the model's response
        return ChatResponse(response=response.text)

    except Exception as e:
        print(f"An error occured: {e}")
        raise  HTTPException(status_code=500, detail="Failed to get reponst from AI model")


# --- Resume Tailoring Endpoint ---
@app.post("/resume-tailor", response_model=ResumeTailorResponse, summary="Tailors Resume for a Job Description")
async def tailor_resume(request: ResumeTailorRequest):
    """
    Endpoint to tailor a resume for a specific job description using Gemini AI.

    Args:
        request (ResumeTailorRequest): The request body containing the base resume and job description.

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
    {request.base_resume}
    ---
    **Job Description:**
    {request.job_description}
    ---
    **Tailored Resume:**
    """

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return ResumeTailorResponse(tailored_resume=response.text)

    except Exception as e:
        print(f"An error occured: {e}")
        raise  HTTPException(status_code=500, detail="Failed to tailor resume.")