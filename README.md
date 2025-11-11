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
```
This project is a full-stack, decoupled application.

[User Browser (localhost)] <--> [Next.js (React) Frontend]
          |
          v
[FastAPI Backend on Cloud Run] <--> [Gemini API]
          |
          v
[Firestore Database]
```
---

### Stack & Rationale

- **Frontend:** **React (Next.js)** + **TypeScript** + **Tailwind CSS**
  - *Why:* A modern, production-grade React framework for fast, type-safe, and beautifully styled component-based UI.
- **Backend:** **Python** + **FastAPI**
  - *Why:* High-performance, asynchronous-first framework that's perfect for I/O-bound tasks like calling external AI APIs.
- **AI Model:** **Google Gemini API**
  - *Why:* High-quality generation for conversational chat and complex text-rewriting tasks.
- **Database:** **Google Firestore (NoSQL)**
  - *Why:* A serverless, scalable document database for storing unstructured data like chat history.
- **DevOps:** **Docker** + **Google Cloud Run** + **GitHub Actions (Pre-Commit)**
  - *Why:* A containerized, serverless-first deployment that scales to zero, with professional, automated linting and formatting.

## Core features

1.  **AI Chat Agent (Backend Implemented)**
    - `POST /chat` endpoint that takes a user message and returns a Gemini-powered response.
    - Saves conversation history to the `chats` collection in Firestore.

2.  **Resume Tailoring (Full-Stack Implemented)**
    - `POST /resume-tailor` endpoint that accepts a base resume and job description via `FormData`.
    - Crafts a detailed prompt for the Gemini API to rewrite the resume, emphasizing skills relevant to the job.
    - A functional Next.js UI to submit the form and render the AI's response.

## Data model (Firestore)

- `chats` (collection)
  - `chatId` (document)
    - `userId` (string, e.g., "user_abc_123")
    - `createdAt` (timestamp)
    - `messages` (array of `{ role: 'user'|'ai', content: string }`)

## Getting started (local development)

This repository is a monorepo containing both the `client` and `server`.

### Prerequisites

- Python 3.12+
- Node.js 18+ and `npm`
- A Google Cloud project with:
  1.  Firestore (in Native Mode) enabled.
  2.  Gemini API enabled.
  3.  A service account with `Cloud Datastore User` and `Secret Manager Secret Accessor` roles.
  4.  A downloaded JSON key for that service account.

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
    - Create a `.env` file in the `server/` directory.
    - Add your credentials:
      ```
      GEMINI_API_KEY="your-gemini-api-key-here"
      GOOGLE_APPLICATION_CREDENTIALS=your-service-account-file.json
      ```
    - Make sure your `.json` key file is also in the `server/` folder.
5.  **Run the backend locally:**
    (Run this from the **root `ApplyAI/` folder** to ensure Python paths work)
    ```bash
    PYTHONPATH=$PYTHONPATH:$(pwd)/server uvicorn server.main:app --reload
    ```
    The API will be live at `http://127.0.0.1:8000/docs`.

### 2) Frontend (`client/`)

1.  **Navigate to the client directory:**
    (From the root folder)
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    - Create a `.env.local` file in the `client/` directory.
    - Add the *live deployed URL* of your backend (not localhost):
      ```
      NEXT_PUBLIC_API_URL=https://applyai-backend-service-....a.run.app
      ```
4.  **Run the frontend locally:**
    ```bash
    npm run dev
    ```
    The app will be live at `http://localhost:3000`.

## Deployment notes

The backend is containerized and deployed to **Google Cloud Run**.

- **Image:** Built from `server/Dockerfile` and hosted on **Google Artifact Registry**.
- **Authentication:** The Cloud Run service uses its default service account. We granted this account the `Cloud Datastore User` role (for Firestore) and `Secret Manager Secret Accessor` role (for the Gemini key).
- **Secrets:** The `GEMINI_API_KEY` is securely injected into the container from **Google Secret Manager**.
- **CORS:** The FastAPI app uses `CORSMiddleware` to allow requests from `http://localhost:3000` (for local dev) and will need to be updated with the production frontend URL.

## Next steps

- [ ] Render the tailored resume as Markdown, not plain text.
- [ ] Implement the frontend UI for the `/chat` endpoint.
- [ ] Add a full CI/CD pipeline with GitHub Actions to auto-test and deploy the backend.
- [ ] Implement full user authentication (e.g., Firebase Auth) and link it to the `userId` in Firestore.

## License

See the [LICENSE](LICENSE) file for details.