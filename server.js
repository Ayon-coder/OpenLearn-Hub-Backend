/**
 * OpenLearn-Hub Backend Server
 * Express server with Firestore integration for Admin Approval System
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.config.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import storageRoutes from './routes/storage.routes.js';
import curriculumRoutes from './routes/curriculum.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174'
];

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/users', usersRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'OpenLearn Hub Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            admin: '/api/admin',
            curriculum: '/api/curriculum'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});

// Initialize Firebase immediately (Required for Vercel Serverless)
try {
    console.log('🔄 Attempting Firebase initialization...');
    initializeFirebase();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ CRITICAL: Firebase initialization failed:', error);
    // Do not throw here to allow health check to pass even if DB fails
    // This distinguishes app crash from DB connection error
}

// ... routes ...

// Export for Vercel
export default app;

// Start server for local development
// In Vercel, this won't run because Vercel imports the app directly
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
    });
}
