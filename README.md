# OpenLearn-Hub Backend

Express.js backend API for OpenLearn-Hub educational platform. Features Firebase Firestore integration, admin authentication, user management, and email notifications.

## 🚀 Features

- **🔐 Authentication** - User registration, login, and admin authentication
- **👤 User Management** - Admin approval system for new users
- **📧 Email Service** - Nodemailer integration for notifications
- **🔥 Firebase** - Firestore database integration
- **🌐 CORS** - Configured for frontend integration
- **📊 Health Checks** - Built-in health monitoring endpoints

## 🛠️ Tech Stack

- **Express.js** - Web Framework
- **Firebase Admin SDK** - Database & Authentication
- **Nodemailer** - Email Service
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment Configuration

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/openlearn-hub-backend.git

# Navigate to the project directory
cd openlearn-hub-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# Firebase Configuration
# Option 1: Base64 encoded service account (recommended for deployment)
FIREBASE_CRED_BASE64=your_base64_encoded_firebase_credentials

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OpenLearn Hub <noreply@openlearnhub.com>
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Go to Project Settings > Service Accounts
4. Generate new private key
5. Convert to base64: 
   ```bash
   base64 -i serviceAccountKey.json
   ```
6. Set `FIREBASE_CRED_BASE64` environment variable

## 🚀 Deployment on Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/openlearn-hub-backend)

### Option 2: Manual Deployment

1. Push your code to GitHub
2. Import the repository in Vercel Dashboard
3. Configure environment variables (see above)
4. Deploy!

### Environment Variables on Vercel

Set these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `FIREBASE_CRED_BASE64` | Base64 encoded Firebase service account |
| `FRONTEND_URL` | Your deployed frontend URL |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `JWT_SECRET` | Secret key for JWT tokens |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail app password |

## 📜 Available Scripts

```bash
# Development server (with watch mode)
npm run dev

# Production server
npm start
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/admin/login` | Admin login |
| `GET` | `/api/admin/users` | Get all users (admin) |
| `PATCH` | `/api/admin/users/:id/approve` | Approve user (admin) |

## 📁 Project Structure

```
backend/
├── config/          # Firebase configuration
├── middleware/      # Auth middleware
├── routes/          # API routes
├── services/        # Business logic & email service
├── server.js        # Entry point
├── vercel.json      # Vercel configuration
└── package.json
```

## 🔗 Related

- [OpenLearn-Hub Frontend](https://github.com/your-username/openlearn-hub-frontend) - React Frontend

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for the love of learning
