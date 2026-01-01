# OpenLearn-Hub Deployment Guide

This guide details the steps to deploy the **OpenLearn-Hub** frontend, backend, and AI assistant to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com/)
- [GitHub Account](https://github.com/) with the project repository pushed.
- [Firebase Project](https://console.firebase.google.com/) with a service account.
- [Google AI Studio Key](https://aistudio.google.com/) (for Gemini) or [Groq Key](https://console.groq.com/).

---

## 1. Backend Deployment (Node.js)

The main backend handles authentication, users, and admin features.

### Step 1.1: Prepare Firebase Credentials

1. Locate your `serviceAccountKey.json` file.
2. Convert it to base64:
   - **Mac/Linux:** `base64 -i serviceAccountKey.json -o serviceAccountBase64.txt`
   - **Windows:** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("./serviceAccountKey.json"))`
3. Copy the string for the `FIREBASE_CRED_BASE64` variable.

### Step 1.2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Import `OpenLearn-Hub` repository.
3. **Configure Project:**
   - **Project Name:** `openlearn-hub-backend`
   - **Root Directory:** `backend` (Important!)
   - **Framework Preset:** "Other"
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `FIREBASE_CRED_BASE64`: *[Your Base64 String]*
     - `ADMIN_USERNAME`: `admin`
     - `ADMIN_PASSWORD`: `[Secure Password]`
     - `JWT_SECRET`: `[Random String]`
     - `EMAIL_HOST`: `smtp.gmail.com`
     - `EMAIL_USER`: `[Your Gmail]`
     - `EMAIL_PASS`: `[App Password]`
     - `FRONTEND_URL`: *[Add after deploying frontend]*

4. Click **Deploy**.

---

## 2. AI Assistant Deployment (Python)

The AI features run on a separate Python Flask service.

### Step 2.1: Deploy to Vercel

1. **Add New Project** in Vercel.
2. Import `OpenLearn-Hub` repository **AGAIN**.
3. **Configure Project:**
   - **Project Name:** `openlearn-hub-ai`
   - **Root Directory:** `backend/ai_assistant` (Very Important!)
   - **Framework Preset:** "Other"
   - **Environment Variables:**
     - `demo_mode`: `False`
     - `active_provider`: `gemini` (or `groq`)
     - `GOOGLE_API_KEY`: `[Your Gemini Key]`
     - `GROQ_API_KEY`: `[Your Groq Key]` (optional)

4. Click **Deploy**.
5. Copy the **Deployment URL** (e.g., `https://openlearn-hub-ai.vercel.app`).

---

## 3. Frontend Deployment

### Step 3.1: Deploy to Vercel

1. **Add New Project** in Vercel.
2. Import `OpenLearn-Hub` repository.
3. **Configure Project:**
   - **Project Name:** `openlearn-hub-frontend`
   - **Root Directory:** `frontend`
   - **Framework Preset:** "Vite"
   - **Environment Variables:**
     - `VITE_API_URL`: `https://openlearn-hub-backend.vercel.app` (Node Backend URL)
     - `VITE_AI_BACKEND_URL`: `https://openlearn-hub-ai.vercel.app` (Python AI URL)

4. Click **Deploy**.

---

## 4. Post-Deployment Connections

1. **Update Node Backend:**
   - Go to `openlearn-hub-backend` settings.
   - Update `FRONTEND_URL` to your new Frontend URL.
   - **Redeploy**.

2. **Verify Connections:**
   - **Log in:** Tests Node Backend.
   - **Use AI Chat:** Tests Python AI Backend.

## Troubleshooting

- **AI Not Replying?** Check `VITE_AI_BACKEND_URL` in Frontend env vars. It must **not** have a trailing slash.
- **CORS Errors?** Ensure `FRONTEND_URL` in Backend matches exactly.
