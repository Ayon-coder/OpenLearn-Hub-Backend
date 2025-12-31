/**
 * Admin Routes
 * Handles admin user management operations
 */

import express from 'express';
import { verifyAdminToken } from '../middleware/admin.middleware.js';
import {
    getAllUsers,
    getPendingUsers,
    getApprovedUsers,
    getUserById,
    approveUser
} from '../services/userService.js';
import { sendApprovalEmail } from '../services/emailService.js';

const router = express.Router();

// All routes require admin authentication
router.use(verifyAdminToken);

/**
 * GET /api/admin/users
 * Get all users (optionally filtered by status)
 */
router.get('/users', async (req, res) => {
    try {
        const { status } = req.query;

        let users;
        if (status === 'pending') {
            users = await getPendingUsers();
        } else if (status === 'approved') {
            users = await getApprovedUsers();
        } else {
            users = await getAllUsers();
        }

        // Remove passwords from response
        const sanitizedUsers = users.map(({ password, ...user }) => user);

        res.json({
            success: true,
            count: sanitizedUsers.length,
            users: sanitizedUsers
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to get users',
            message: error.message
        });
    }
});

/**
 * GET /api/admin/users/:userId
 * Get single user details
 */
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: `No user found with ID: ${userId}`
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: error.message
        });
    }
});

/**
 * PATCH /api/admin/users/:userId/approve
 * Approve a user and send notification email
 */
router.patch('/users/:userId/approve', async (req, res) => {
    try {
        const { userId } = req.params;

        // Approve user (atomic update)
        const user = await approveUser(userId);

        // Only send email if this is a new approval (not already approved)
        let emailResult = null;
        if (!user.alreadyApproved) {
            try {
                emailResult = await sendApprovalEmail(user.email, user.name);
                console.log(`📧 Approval email sent to: ${user.email}`);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
                // Don't fail the approval if email fails
                emailResult = { success: false, error: emailError.message };
            }
        } else {
            console.log(`ℹ️ User ${userId} was already approved, skipping email`);
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: user.alreadyApproved
                ? 'User was already approved'
                : 'User approved successfully',
            user: userWithoutPassword,
            emailSent: emailResult ? emailResult.success : false
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            error: 'Failed to approve user',
            message: error.message
        });
    }
});

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const allUsers = await getAllUsers();
        const pendingUsers = await getPendingUsers();
        const approvedUsers = await getApprovedUsers();

        // Count by role
        const roleStats = allUsers.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            stats: {
                total: allUsers.length,
                pending: pendingUsers.length,
                approved: approvedUsers.length,
                byRole: roleStats
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get stats',
            message: error.message
        });
    }
});

export default router;
