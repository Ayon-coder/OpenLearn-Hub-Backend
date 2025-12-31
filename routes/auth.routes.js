/**
 * Auth Routes
 * Handles user registration and login
 */

import express from 'express';
import { createUser, getUserByEmail, emailExists } from '../services/userService.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with approved: false
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, verificationData } = req.body;

        // Validate required fields
        if (!email || !password || !name || !role) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Email, password, name, and role are required'
            });
        }

        // Check if email already exists
        if (await emailExists(email)) {
            return res.status(409).json({
                error: 'Email already registered',
                message: 'An account with this email already exists'
            });
        }

        // Create user in Firestore with approved: false
        const user = await createUser({
            email,
            password, // Note: In production, hash this password!
            name,
            role,
            verificationData: verificationData || {},
            verificationStatus: 'pending'
        });

        console.log(`📝 New user registered: ${email} (${role})`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully. Please wait for admin verification.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                approved: user.approved
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Login user - checks approval status
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }

        // Get user by email
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                error: 'Account not found',
                message: 'No account found with this email. Please create an account first.',
                notFound: true
            });
        }

        // Check password (simple comparison - use bcrypt in production!)
        if (user.password !== password) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Check if user is approved
        if (!user.approved) {
            return res.status(403).json({
                error: 'Account not approved',
                message: 'Your account is pending verification. You will be notified via email once approved.',
                approved: false
            });
        }

        console.log(`✅ User logged in: ${email}`);

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/admin/login
 * Admin login with credentials from .env
 */
router.post('/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;

        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Admin username or password is incorrect'
            });
        }

        // Generate simple session token (use JWT in production)
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

        console.log(`🔐 Admin logged in`);

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: {
                username: ADMIN_USERNAME,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            error: 'Admin login failed',
            message: error.message
        });
    }
});

/**
 * GET /api/auth/check/:email
 * Check if email is registered and get approval status
 */
router.get('/check/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await getUserByEmail(email);

        if (!user) {
            return res.json({ exists: false });
        }

        res.json({
            exists: true,
            approved: user.approved
        });
    } catch (error) {
        res.status(500).json({
            error: 'Check failed',
            message: error.message
        });
    }
});

export default router;
