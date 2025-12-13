# ApplyAI — AI Job Application Assistant

ApplyAI is a cloud-native, AI-powered assistant that helps streamline the job search. The MVP focuses on shortening application time, increasing application volume, and improving the quality of each submission by providing AI-driven resume tailoring and conversational career guidance.

## Table of contents

- [Overview & Goals](#overview--goals)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Core features](#core-features)
- [Data model (Firestore)](#data-model-firestore)
- [Getting started (local development)](#getting-started-local-development)
- [Deployment notes](#deployment-notes)
- [Next steps](#next-steps)
- [License](#license)

## Overview & Goals

ApplyAI helps job seekers automate and improve their job applications. The MVP aims to:

- Reduce application time by automating tailored materials.
- Increase application throughput by making it easy to generate high-quality applications.
- Maximize job-fit relevance by emphasizing the most relevant skills in tailored resumes.

## Architecture & Tech Stack

This project is a full-stack, decoupled application.
```
[User Browser (localhost)] <--> [Next.js (React) Frontend] <--> [Firebase Auth]
          |
          v
[FastAPI Backend (Local/Cloud)] <--> [Gemini API]
          |
          v
[Firestore Database]
```

### Stack & Rationale

- **Frontend:** **React (Next.js)** + **TypeScript** + **Tailwind CSS**
  - *Why:* A modern, production-grade React framework for fast, type-safe, and beautifully styled component-based UI.
- **Auth:** **Firebase Authentication** (Google OAuth)
  - *Why:* Secure, easy-to-implement identity management that integrates natively with Firestore.
- **Backend:** **Python** + **FastAPI**
  - *Why:* High-performance, asynchronous-first framework that's perfect for I/O-bound tasks like calling external AI APIs.
- **AI Model:** **Google Gemini API**
  - *Why:* High-quality generation for conversational chat and complex text-rewriting tasks.
- **Database:** **Google Firestore (NoSQL)**
  - *Why:* A serverless, scalable document database for storing unstructured data like chat history.
- **DevOps:** **Docker** + **Google Cloud Run**
  - *Why:* A containerized, serverless-first deployment that scales to zero.

## Core features

1.  **Authentication (Frontend Implemented)**
    - Secure Google Sign-In via Firebase.
    - Global session management using React Context.

2.  **Resume Tailoring (Full-Stack Implemented)**
    - `POST /resumes` endpoint that accepts a base resume and job description.
    - Generates a tailored resume using Gemini and renders it as formatted Markdown.
    - Saves the result to Firestore linked to the user.

3.  **AI Chat Agent (Backend Implemented)**
    - `POST /chat` endpoint that takes a user message and returns a Gemini-powered response.

## Data model (Firestore)

- `chats` (collection)
  - `chatId` (document)
    - `userId` (string)
    - `messages` (array of `{ role: 'user'|'ai', content: string }`)

- `tailored_resumes` (collection)
  - `resumeId` (document)
    - `userId` (string)
    - `originalResume` (string)
    - `jobDescription` (string)
    - `tailoredResume` (string - Markdown)
    - `createdAt` (timestamp)

## Getting started (local development)

This repository is a monorepo containing both the `client` and `server`.

### Prerequisites

- Python 3.12+
- Node.js 18+ and `npm`
- A Google Cloud project with Firestore, Gemini API, and Firebase Auth enabled.

### 1) Backend (`server/`)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure environment variables:**
    Create a `.env` file in `server/` with:
    ```
    GEMINI_API_KEY="your-gemini-api-key"
    GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
    ```
5.  **Run the backend locally:**
    (Run from root folder)
    ```bash
    PYTHONPATH=$PYTHONPATH:$(pwd)/server uvicorn server.main:app --reload --port 8000
    ```
    API docs: `http://127.0.0.1:8000/docs`

### 2) Frontend (`client/`)

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env.local` file in `client/` with:
    ```bash
    # Point to your local Python backend
    NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

    # Firebase Configuration (Get these from Firebase Console)
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
    ```
4.  **Run the frontend locally:**
    ```bash
    npm run dev
    ```
    App: `http://localhost:3000`

## Deployment notes

The backend is deployed to **Google Cloud Run**. The frontend is currently local but can be deployed to Vercel or Firebase Hosting.

- **CORS:** The FastAPI app allows requests from `http://localhost:3000`. For production, update `server/main.py` with the deployed frontend domain.

## Next steps

- [x] Render the tailored resume as Markdown.
- [x] Implement full user authentication (Firebase Auth).
- [ ] Connect Frontend User ID to Backend (Save real user data).
- [ ] Implement the frontend UI for the `/chat` endpoint.
- [ ] Add a full CI/CD pipeline with GitHub Actions.

## License

See the [LICENSE](LICENSE) file for details.