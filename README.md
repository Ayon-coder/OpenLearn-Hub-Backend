<div align="center">

# ⚙️ OpenLearn Hub - Backend

### **The Robust API Infrastructure for OpenLearn Hub**

A scalable backend system powered by Node.js, Express, Firebase Admin SDK, and Python AI Services

[Features](#-features) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [AI Assistant](#-ai-assistant) • [Deployment](#-deployment)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

---

## 📖 Overview

The **OpenLearn Hub Backend** is the robust backbone of the platform, providing secure, scalable, and real-time APIs. It consists of two main components:

1. **Node.js/Express Server** - Handles authentication, user management, and admin operations with Firebase Firestore
2. **Python Flask Server** - Powers the AI Assistant with Gemini/Groq integration for intelligent learning support

---

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration**: Multi-role registration (Student, Teacher) with verification workflow
- **Admin Approval System**: New accounts require admin verification before access
- **Login Security**: Password validation with approval status checking
- **Email Notifications**: Automated approval emails via Nodemailer

### 👨‍💼 Admin Operations
- **User Management**: View all users, filter by status (pending/approved)
- **Approval Workflow**: Approve users with automatic email notification
- **Dashboard Statistics**: Real-time stats on users by role and status
- **Role-Based Access**: Protected admin routes with token verification

### 🤖 AI-Powered Services
- **Mentor Mode**: Interactive AI chat for learning assistance
- **Concept Mirror**: AI-powered analysis of user explanations
- **Curriculum Generator**: AI-generated personalized learning paths with Groq
- **Persistence Layer**: Save, retrieve, and track progress of generated curricula
- **Multi-Provider Support**: Seamlessly switch between Gemini and Groq
- **Demo Mode**: Fallback responses when API keys are unavailable

### 📧 Email Service
- **SMTP Integration**: Gmail SMTP support via Nodemailer
- **HTML Templates**: Professional email templates for notifications
- **Graceful Fallback**: Console logging when email is not configured

### 🔥 Firebase Integration
- **Firestore Database**: Real-time NoSQL database for user data
- **Admin SDK**: Secure server-side Firebase operations
- **Flexible Configuration**: Support for base64 encoded or JSON credentials

---

## 🛠️ Tech Stack

### Node.js Backend

| Technology | Version | Purpose |
|:---|:---|:---|
| **Node.js** | >= 18.0.0 | Runtime environment |
| **Express.js** | 4.x | Web framework |
| **Firebase Admin** | 12.x | Database & authentication |
| **Nodemailer** | 6.x | Email delivery |
| **CORS** | 2.x | Cross-origin support |
| **Dotenv** | 16.x | Environment management |

### Python AI Backend

| Technology | Version | Purpose |
|:---|:---|:---|
| **Python** | >= 3.11 | Runtime environment |
| **Flask** | >= 3.0.0 | Web framework |
| **Flask-CORS** | >= 4.0.0 | Cross-origin support |
| **google-generativeai** | >= 0.8.0 | Gemini AI SDK |
| **groq** | >= 0.11.0 | Groq AI SDK |

---

## 📁 Project Structure

```
backend/
├── config/
│   └── firebase.config.js      # Firebase Admin initialization
├── middleware/
│   └── admin.middleware.js     # Admin authentication middleware
├── routes/
│   ├── auth.routes.js          # Authentication endpoints
│   └── admin.routes.js         # Admin management endpoints
│   ├── services/
│   │   ├── userService.js          # User CRUD operations
│   │   ├── emailService.js         # Email notification service
│   │   ├── curriculumService.js    # Curriculum CRUD with Firestore
│   │   └── curriculumPrompt.js     # AI prompt for curriculum generation
├── ai_assistant/               # Python AI Backend
│   ├── api.py                  # Flask REST API
│   ├── ai_client.py            # AI provider client factory
│   ├── config.py               # Configuration management
│   ├── demo.py                 # Demo mode responses
│   ├── prompts.py              # AI prompt templates
│   ├── gemini_provider/        # Gemini integration
│   ├── groq_provider/          # Groq integration
│   ├── requirements.txt        # Python dependencies
│   └── vercel.json             # Vercel deployment config
├── server.js                   # Main Express server entry
├── package.json                # Node.js dependencies
├── vercel.json                 # Vercel deployment config
├── .env.example                # Environment variables template
└── serviceAccountKey.json      # Firebase credentials (not in git)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.11 (for AI Assistant)
- **Firebase Project** with Firestore enabled

### 1. Clone the Repository

```bash
git clone https://github.com/tech-akash010/OpenLearn-Hub.git
cd OpenLearn-Hub/backend
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies (for AI Assistant)

```bash
cd ai_assistant
pip install -r requirements.txt
cd ..
```

### 4. Environment Setup

Create a `.env` file in the backend directory:

```env
# =============================================================================
# Server Configuration
# =============================================================================
PORT=5000
FRONTEND_URL=http://localhost:5173

# =============================================================================
# Firebase Configuration
# =============================================================================
# Option 1: Base64 encoded service account (recommended for deployment)
FIREBASE_CRED_BASE64=your_base64_encoded_firebase_credentials

# Option 2: Place serviceAccountKey.json in the backend folder

# =============================================================================
# Admin Credentials
# =============================================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_jwt_key_here

# =============================================================================
# Email Configuration (Gmail SMTP)
# =============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OpenLearn Hub <noreply@openlearnhub.com>

# =============================================================================
# AI Assistant Configuration (Python Backend)
# =============================================================================
ACTIVE_PROVIDER=gemini
ACTIVE_MODEL=
GOOGLE_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
FLASK_HOST=127.0.0.1
FLASK_PORT=5050
FLASK_DEBUG=True
DEMO_MODE=False
```

### 5. Run the Servers

#### Start Node.js Backend

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The Node.js server will run at `http://localhost:5000`

#### Start Python AI Backend

```bash
cd ai_assistant
python api.py
```

The AI server will run at `http://localhost:5050`

---

## 📡 API Reference

### Health Check

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | API information |
| `GET` | `/health` | Health check status |

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | User login |
| `POST` | `/admin/login` | Admin login |
| `GET` | `/check/:email` | Check email status |

#### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "student",
  "verificationData": {}
}
```

#### User Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Admin Routes (`/api/admin`)

> ⚠️ All admin routes require the `Authorization` header with admin token

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/users` | Get all users |
| `GET` | `/users?status=pending` | Get pending users |
| `GET` | `/users?status=approved` | Get approved users |
| `GET` | `/users/:userId` | Get user details |
| `PATCH` | `/users/:userId/approve` | Approve a user |
| `GET` | `/stats` | Get dashboard statistics |

### Curriculum Routes (`/api/curriculum`)

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/generate` | Generate AI curriculum |
| `GET` | `/:id` | Get curriculum by ID |
| `GET` | `/user/:userId` | **[NEW]** Get all saved curricula for a user |
| `DELETE` | `/:id` | Delete curriculum |
| `PATCH` | `/:id/progress` | Update learning progress |

#### Generate Curriculum
```json
POST /api/curriculum/generate
{
  "userId": "user123",
  "learning_goal": "Machine Learning",
  "current_level": "Beginner",
  "focus_areas": ["Python", "Neural Networks"],
  "prior_knowledge": "Basic Python programming",
  "time_commitment": "10-20 hours/week",
  "learning_objectives": "Build ML models",
  "learning_style": "hands-on"
}
```

---

## 🤖 AI Assistant

The AI Assistant runs as a separate Python Flask server and provides intelligent learning support.

### AI Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` or `/health` | Health check |
| `GET` | `/config` | Get current configuration |
| `POST` | `/mentor` | Mentor mode chat |
| `POST` | `/analyze` | Concept analysis |
| `POST` | `/generate` | Simple text generation |

### Mentor Mode
```json
POST /mentor
{
  "messages": [
    {"role": "user", "content": "Explain binary search"}
  ],
  "topic": "Data Structures"
}
```

### Concept Analysis
```json
POST /analyze
{
  "concept": "Binary Search",
  "explanation": "Binary search is a way to find things faster..."
}
```

### Supported AI Providers

| Provider | Models | Notes |
|:---|:---|:---|
| **Gemini** | gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash | Recommended for chat |
| **Groq** | llama-3.3-70b-versatile, llama-3.1-8b-instant, meta-llama/llama-4-scout-17b-16e-instruct | Used for curriculum generation |

---

## 🔧 Firebase Setup

### Option 1: Base64 Encoded Credentials (Recommended for Deployment)

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (downloads JSON file)
3. Encode to base64:
   ```bash
   # On macOS/Linux
   base64 -i serviceAccountKey.json | tr -d '\n'
   
   # On Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
   ```
4. Set `FIREBASE_CRED_BASE64` in your `.env` file

### Option 2: JSON File (Development)

1. Download the service account JSON from Firebase Console
2. Save as `serviceAccountKey.json` in the backend folder
3. Add to `.gitignore` (already configured)

---

## 📧 Email Configuration

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password as `EMAIL_PASS` in your `.env`

---

## 📦 Deployment

### Vercel Deployment

Both the Node.js and Python backends can be deployed to Vercel:

```bash
# Deploy Node.js backend
cd backend
vercel

# Deploy Python AI backend
cd ai_assistant
vercel
```

### Environment Variables on Vercel

Set all required environment variables in the Vercel dashboard:
- `FIREBASE_CRED_BASE64`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL`
- `GOOGLE_API_KEY` (for AI)
- `GROQ_API_KEY` (for AI)

---

## 🔒 Security Considerations

1. **Never commit `.env` or `serviceAccountKey.json`**
2. **Use strong passwords** for admin credentials
3. **Enable HTTPS** in production
4. **Hash passwords** before storing (enhancement needed)
5. **Use JWT** for production session management (enhancement needed)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 Related Links

- **Frontend Repository**: https://github.com/Ayon-coder/OpenLearn-Hub-Frontend.git

