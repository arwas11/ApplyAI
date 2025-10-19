# ApplyAI — AI Job Application Assistant

ApplyAI is a cloud-native, AI-powered assistant that helps streamline job search. The MVP focuses on shortening application time, increasing application volume, and improving the quality of each submission by providing AI-driven resume tailoring, conversational career guidance, and draft answers to application questions.

## Table of contents

- [Overview & Goals](#overview--goals)
- [User stories](#user-stories)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Core features](#core-features)
- [Data model (Firestore)](#data-model-firestore)
- [Getting started (local development)](#getting-started-local-development)
- [Deployment notes](#deployment-notes)
- [Next steps](#next-steps)
- [Contributing](#contributing)
- [License](#license)

## Overview & Goals

ApplyAI helps job seekers automate and improve their job applications. The MVP aims to:

- Reduce application time by automating tailored materials
- Increase application throughput by making it easy to generate many high-quality applications
- Improve users' skills through iterative AI-guided feedback
- Maximize job-fit relevance by emphasizing the most relevant skills in tailored resumes and answers

## User stories

User stories (MVP):

- Chat with an AI agent about career goals and potential opportunities.
- Input a job description and get a tailored resume that highlights the most relevant skills and experiences.
- Provide application questions and receive AI-generated draft answers based on the user's resume and the job description.
- Maintain chat history so the assistant becomes more personalized over time.

## Architecture & Tech Stack

High-level architecture:

[User Browser] <--> [Next.js (React) Frontend on Firebase Hosting]
					|
					v
[FastAPI Backend on Cloud Run] <--> [Gemini API]
					|
					v
[Firestore Database]

Stack choices and rationale:

- Frontend: React + Next.js + Tailwind — fast, component-based UI and good developer ergonomics.
- Backend: Python + FastAPI — quick to develop, high performance, easy integration with AI APIs.
- AI Model: Google Gemini API — chosen for high-quality generation across chat, resume tailoring, and question-answering.
- Database: Firestore — serverless NoSQL for chat history, user profiles, and resume versions.
- Auth: Firebase Authentication — simple, secure sign-in for users.

## Core features

1) AI Chat Agent

- Streamed conversational interface.
- Backend collects recent chat history from Firestore to provide context and personalization.

2) Resume Tailoring

- Users upload a base resume (Markdown, PDF, or JSON) and paste a job description.
- A `/tailor-resume` endpoint crafts prompts for the Gemini API to produce a tailored resume emphasizing relevant skills.

3) Application Question Answering

- Users enter application questions (e.g., "Why this role?") and receive draft answers derived from their base resume and the job description.

4) Chat history & personalization

- Conversations are saved in Firestore and used to provide context on subsequent requests.

## Data model (Firestore)

Two main collections are used:

- `users` (document ID = `userId`)
	- `email` (string)
	- `createdAt` (timestamp)
	- `baseResume` (JSON object)

- `chats` (document ID = `chatId`)
	- `userId` (reference)
	- `createdAt` (timestamp)
	- `messages` (array of { role: 'user'|'assistant', content: string })

## Getting started (local development)

This repository currently contains the project skeleton. The following steps outline how to set up the backend and frontend for local development.

1) Prerequisites

- Python 3.10+ (recommended)
- Node.js 18+ and npm or yarn
- Google Cloud project with Firestore and the Gemini API enabled (or other LLM provider configured)
- Firebase project for Authentication and Hosting (optional for local testing)

2) Backend (FastAPI)

- Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- Configure environment variables (example):

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export FIREBASE_PROJECT_ID="your-gcp-project-id"
export GEMINI_API_KEY="your-gemini-api-key"
export FASTAPI_PORT=8000
```

- Run the backend locally

```bash
uvicorn main:app --reload --port ${FASTAPI_PORT}
```

3) Frontend (Next.js)

- Install dependencies and run dev server

```bash
cd frontend
npm install
npm run dev
```

4) Notes about AI provider

- The design targets Google's Gemini API, but the backend is written to be provider-agnostic. You can configure a different LLM endpoint by setting the relevant environment variables and updating the API client module.

## Deployment notes

- Backend: Deploy the FastAPI app to Cloud Run. Use the provided Dockerfile (if present) or create one following Cloud Run best practices. Ensure the service account used by Cloud Run has access to Firestore and any other GCP APIs in use.
- Frontend: Deploy the Next.js app to Firebase Hosting or Vercel.
- Authentication: Use Firebase Authentication for sign-in flows. Protect backend endpoints with Firebase token verification.

## Next steps

- Implement endpoints: `/chat`, `/tailor-resume`, `/answer-question`.
- Add CI: linting, type checks, and unit tests.
- Build a minimal frontend UI for chat and resume tailoring flows.
- Add streaming support for assistant responses.
- Add rate-limiting and usage controls.

## Contributing

Please open issues or pull requests. For major changes, open an issue first to discuss what you'd like to change.

## License

This project is MIT licensed — see the LICENSE file for details.
