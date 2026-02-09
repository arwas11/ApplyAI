from pydantic import BaseModel
from typing import List
import datetime


class ChatRequest(BaseModel):
    message: str
    user_id: str


class ChatResponse(BaseModel):
    response: str


class ResumeTailorResponse(BaseModel):
    tailored_resume: str


class MessageModel(BaseModel):
    role: str
    content: str


class ChatSessionResponse(BaseModel):
    id: str
    messages: List[MessageModel]
    timestamp: datetime.datetime


class ResumeSessionResponse(BaseModel):
    id: str
    originalResume: str
    tailoredResume: str
    createdAt: datetime.datetime
