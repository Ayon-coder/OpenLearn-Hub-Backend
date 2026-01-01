<div align="center">

# ⚙️ OpenLearn Hub - Backend

### **The Robust API Infrastructure for OpenLearn Hub**

[Features](#-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [API Reference](#-api-reference)

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-007ACC?style=for-the-badge&logo=minutemailer&logoColor=white)

</div>

---

## ☀️ Overview

The **OpenLearn Hub Backend** serves as the backbone of the platform, providing secure, scalable, and real-time APIs. It leverages the power of **Node.js** and **Express**, integrated with **Firebase Admin SDK** for robust authentication and Firestore database management, covering everything from user roles to AI-powered features.

---

## ✨ Features

### 🔒 Secure Authentication & User Management
*   **Role-Based Access Control (RBAC):** Secure middleware to handle permissions for Students, Teachers, and Admins.
*   **Firebase Auth Integration:** Seamless and secure user verification via Firebase Admin SDK.

### 🤖 AI-Powered Capabilities
*   **AI Assistant Integration:** Connects with Gemini/Groq APIs to provide intelligent responses and coding assistance.
*   **Complexity Analysis:** Backend support for analyzing code complexity and generating feedback.

### 📧 Communication Ecosystem
*   **Automated Emails:** Logic for sending welcome emails, notifications, and verification links using **Nodemailer**.
*   **Admin Notifications:** Real-time alerts for administrative actions.

### 🛡️ Administration Dashboard
*   **User Approvals:** Endpoints for admins to approve or reject instructor applications.
*   **Content Management:** APIs for managing community notes, courses, and resources.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **Firebase Admin** | Database (Firestore) & Auth |
| **Nodemailer** | Email Service |
| **Dotenv** | Configuration Management |
| **Cors** | Cross-Origin Resource Sharing |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Ayon-coder/OpenLearn-Hub-Backend.git
cd OpenLearn-Hub-Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
FIREBASE_CRED_BASE64=your_base64_encoded_service_account
# ... (see .env.example for full list)
```

### 4. Run the Server
```bash
# Development mode
npm run dev

# Production
npm start
```

---

## 🔗 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/admin/users` | Get all users (Admin only) |
| `PATCH` | `/api/admin/users/:id/approve` | Approve a user (Admin only) |

<br>

<div align="center">
  <p>Made with ❤️ for OpenLearn Hub</p>
</div>
