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
import curriculumRoutes from './routes/curriculum.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    // Basic connectivity check
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'openlearn-hub-backend',
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        uptime: process.uptime()
    };

    // Log health check access for debugging quota issues
    console.log(`[Health Check] Status 200 OK - ${healthStatus.timestamp}`);

    res.json(healthStatus);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/curriculum', curriculumRoutes);

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

// Only start server if running directly (Local Development)
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
    });
}
