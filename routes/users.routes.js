/**
 * User Lookup Routes
 * Provides email-to-name resolution for content display
 */

import express from 'express';
import { getUserByEmail } from '../services/userService.js';

const router = express.Router();

/**
 * GET /api/users/lookup?email=xxx
 * Returns the user name for a given email
 */
router.get('/lookup', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return res.json({
                found: false,
                name: null,
                email
            });
        }

        res.json({
            found: true,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('User lookup error:', error);
        res.status(500).json({ error: 'Failed to lookup user' });
    }
});

/**
 * POST /api/users/batch-lookup
 * Lookup multiple emails at once (for list views)
 */
router.post('/batch-lookup', async (req, res) => {
    try {
        const { emails } = req.body;

        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({ error: 'Emails array is required' });
        }

        const results = {};

        // Process in parallel for efficiency (limit to avoid overwhelming Firestore)
        const lookupPromises = emails.slice(0, 50).map(async (email) => {
            try {
                const user = await getUserByEmail(email);
                results[email] = user ? { name: user.name, role: user.role } : null;
            } catch {
                results[email] = null;
            }
        });

        await Promise.all(lookupPromises);

        res.json(results);
    } catch (error) {
        console.error('Batch lookup error:', error);
        res.status(500).json({ error: 'Failed to batch lookup users' });
    }
});

export default router;
