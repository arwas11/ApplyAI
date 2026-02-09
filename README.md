# ApplyAI — AI Job Application Assistant

ApplyAI is a cloud-native, AI-powered assistant that helps streamline the job search. The MVP focuses on shortening application time, increasing application volume, and improving the quality of each submission by providing AI-driven resume tailoring and conversational career guidance.

## Table of contents

- [Overview & Goals](#overview--goals)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Core Features](#core-features)
- [Data Model (Firestore)](#data-model-firestore)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Testing Suite](#testing-suite)
- [Roadmap](#roadmap)
- [License](#license)

## Overview & Goals

ApplyAI helps job seekers automate and improve their job applications. The MVP aims to:

- **Reduce application time** by automating tailored materials.
- **Increase application throughput** by making it easy to generate high-quality applications.
- **Maximize job-fit relevance** by emphasizing the most relevant skills in tailored resumes using state-of-the-art LLMs.

## Architecture & Tech Stack

This project is a full-stack, decoupled application following a modern serverless-first architecture.

```mermaid
graph TD;
    User((User)) -->|Next.js/React| FE[Frontend Client];
    FE -->|Auth| FB_Auth[Firebase Auth];
    FE -->|JSON/REST| BE[FastAPI Backend];
    BE -->|Query/Write| FS[(Cloud Firestore)];
    BE -->|Prompt/Text| Gemini[Google Gemini AI];
```

To ensure VS Code recognizes the formatting immediately, I have placed the remaining content inside a single block. Copy everything from the box below and paste it directly after your Mermaid diagram.

Markdown
### Stack & Rationale

* **Frontend:** **React (Next.js 15)** + **TypeScript** + **Tailwind CSS**
  * Modern, type-safe UI with efficient client-side routing and global state management via React Context.
* **Auth:** **Firebase Authentication** (Google OAuth)
  * Secure identity management that provides unique UIDs to link data across the stack.
* **Backend:** **Python 3.12** + **FastAPI**
  * High-performance, asynchronous framework optimized for I/O-bound tasks like AI model inference.
* **AI Model:** **Google Gemini 2.5 Flash**
  * Utilized for both conversational "Career Coach" interactions and complex "Resume Tailoring" logic.
* **Database:** **Google Firestore (NoSQL)**
  * A serverless document database used to persist user-specific chat history and resume generation sessions.
* **DevOps:** **GitHub Actions** + **Pytest**
  * Automated CI/CD pipeline ensuring code quality and 100% mocked backend testing.

## Core Features

1.  **Authentication & Security**
    * Secure Google Sign-In with persistent session management.
    * Environment-driven configuration for API keys and Cloud credentials.
2.  **Persistent AI Chat History**
    * `POST /chat` and `GET /chats/{user_id}` endpoints.
    * Career guidance that persists across sessions, allowing users to pick up where they left off.
3.  **Resume Tailoring Engine**
    * `POST /resumes` and `GET /resumes/{user_id}` endpoints.
    * Intelligent rewriting of resumes based on job descriptions, saved to the cloud for future reference.

## Data Model (Firestore)

* **chats** (collection)
  * `doc_id` (auto-generated)
    * `user_id` (string)
    * `messages` (array of `{ role: 'user'|'ai', content: string }`)
    * `timestamp` (serverTimestamp)

* **tailored_resumes** (collection)
  * `doc_id` (auto-generated)
    * `user_id` (string)
    * `jobDescription` (string)
    * `originalResume` (string)
    * `tailoredResume` (string - Markdown)
    * `createdAt` (timestamp)

## Getting Started (Local Development)

### Prerequisites
* Python 3.12+ / Node.js 18+
* Google Cloud Service Account with Firestore and Gemini API access.

### 1) Backend (`server/`)
1. `cd server && python3 -m venv .venv && source .venv/bin/activate`
2. `pip install -r requirements.txt`
3. Create `.env` with `GEMINI_API_KEY` and `GOOGLE_APPLICATION_CREDENTIALS`.
4. Run: `PYTHONPATH=. uvicorn main:app --reload --port 8000`

### 2) Frontend (`client/`)
1. `cd client && npm install`
2. Create `.env.local` with your Firebase config and `NEXT_PUBLIC_API_URL`.
3. Run: `npm run dev`

## Testing Suite

The backend includes a robust unit testing suite using `Pytest` and `mocker`. To maintain speed and zero-cost CI, all external calls to Gemini and Firestore are fully mocked to prevent network dependency and unnecessary API costs.

**To run tests:**
```bash
cd server
pytest
```

## Deployment Notes

The backend is deployed to **Google Cloud Run**. The frontend is currently local but configured for deployment to Vercel or Firebase Hosting.

* **CORS:** The FastAPI app allows requests from `http://localhost:3000`. For production, update `server/main.py` with the deployed frontend domain.

## Roadmap

- [x] **Phase 1:** Core AI Tailoring Logic & Form UI.
- [x] **Phase 2:** Firebase Authentication & Global Context.
- [x] **Phase 3:** Backend Persistence (Firestore) & Naming Convention Alignment.
- [x] **Phase 4:** Mocked Test Infrastructure & History API Endpoints.
- [ ] **Phase 5:** Frontend Hydration (Displaying historical chats/resumes in the UI).
- [ ] **Phase 6:** Production Deployment (Cloud Run & Vercel).

## License

See the [LICENSE](LICENSE) file for details.