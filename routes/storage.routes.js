import express from 'express';
import { githubStorageService } from '../services/githubStorageService.js';
import { regenerateToon } from '../services/toonService.js';

const router = express.Router();

// GET /api/storage/global - Read-only public content
router.get('/global', async (req, res) => {
    try {
        const data = await githubStorageService.getGlobalData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch global content' });
    }
});

// POST /api/storage/global - Add new global content
router.post('/global', async (req, res) => {
    try {
        const contentItem = req.body;
        if (!contentItem) {
            return res.status(400).json({ error: 'No content provided' });
        }

        await githubStorageService.addToGlobalData(contentItem);

        // Regenerate Toon for LLM context (async, don't block response)
        regenerateToon().catch(err => console.error('Toon regen background error:', err));

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to add to global content:', error);
        res.status(500).json({ error: 'Failed to update global content' });
    }
});

// GET /api/storage/user/:userId - Read user profile (creates if missing)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await githubStorageService.getUserData(userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch data for user ${req.params.userId}` });
    }
});

// GET /api/storage/debug/connection - Test GitHub Configuration
router.get('/debug/connection', async (req, res) => {
    try {
        const { octokit, githubConfig } = await import('../config/github.config.js');

        // 1. Check Config Existence
        const configStatus = {
            hasToken: !!process.env.GITHUB_TOKEN,
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH || 'main (default)'
        };

        const checks = {
            config: configStatus,
            auth: false,
            repoAccess: false
        };

        // 2. Test Authentication
        try {
            const { data: user } = await octokit.users.getAuthenticated();
            checks.auth = `Authenticated as ${user.login}`;
        } catch (authErr) {
            checks.auth = `Failed: ${authErr.message}`;
        }

        // 3. Test Repository Access
        if (configStatus.owner && configStatus.repo) {
            try {
                const { data: repo } = await octokit.repos.get({
                    owner: configStatus.owner,
                    repo: configStatus.repo
                });
                checks.repoAccess = `Access OK: ${repo.full_name} (${repo.private ? 'Private' : 'Public'})`;
            } catch (repoErr) {
                checks.repoAccess = `Failed: ${repoErr.message}`;
            }
        } else {
            checks.repoAccess = 'Skipped: Owner or Repo missing';
        }

        res.json({
            status: (checks.auth.includes('Authenticated') && checks.repoAccess.includes('Access OK')) ? 'OK' : 'ERROR',
            checks
        });

    } catch (error) {
        res.status(500).json({ error: 'Debug check failed', details: error.message });
    }
});

// GET /api/storage/debug/connection - Test GitHub Configuration
router.get('/debug/connection', async (req, res) => {
    try {
        const { octokit, githubConfig } = await import('../config/github.config.js');

        // 1. Check Config Existence
        const configStatus = {
            hasToken: !!process.env.GITHUB_TOKEN,
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH || 'main (default)'
        };

        const checks = {
            config: configStatus,
            auth: false,
            repoAccess: false
        };

        // 2. Test Authentication
        try {
            const { data: user } = await octokit.users.getAuthenticated();
            checks.auth = `Authenticated as ${user.login}`;
        } catch (authErr) {
            checks.auth = `Failed: ${authErr.message}`;
        }

        // 3. Test Repository Access
        if (configStatus.owner && configStatus.repo) {
            try {
                const { data: repo } = await octokit.repos.get({
                    owner: configStatus.owner,
                    repo: configStatus.repo
                });
                checks.repoAccess = `Access OK: ${repo.full_name} (${repo.private ? 'Private' : 'Public'})`;
            } catch (repoErr) {
                checks.repoAccess = `Failed: ${repoErr.message}`;
            }
        } else {
            checks.repoAccess = 'Skipped: Owner or Repo missing';
        }

        res.json({
            status: (checks.auth.includes('Authenticated') && checks.repoAccess.includes('Access OK')) ? 'OK' : 'ERROR',
            checks
        });

    } catch (error) {
        res.status(500).json({ error: 'Debug check failed', details: error.message });
    }
});

// POST /api/storage/user/:userId - Update user profile
router.post('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = req.body;

        if (!data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const updated = await githubStorageService.updateUserData(userId, data);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('❌ Failed to update user profile:', error.message || error);
        res.status(500).json({ error: `Failed to update data for user ${req.params.userId}: ${error.message}` });
    }
});

// POST /api/storage/toon/regenerate - Manually regenerate toon (for initial setup)
router.post('/toon/regenerate', async (req, res) => {
    try {
        console.log('🔄 Manual toon regeneration triggered...');
        const toon = await regenerateToon();
        res.json({
            success: true,
            message: 'Toon regenerated successfully',
            stats: {
                totalContent: toon.totalAvailable,
                categories: toon.categories.length
            }
        });
    } catch (error) {
        console.error('❌ Toon regeneration failed:', error);
        res.status(500).json({ error: 'Failed to regenerate toon', details: error.message });
    }
});

// GET /api/storage/toon - Get current toon
router.get('/toon', async (req, res) => {
    try {
        const { getToon } = await import('../services/toonService.js');
        const toon = await getToon();
        if (!toon) {
            return res.status(404).json({ error: 'Toon not found. Use POST /api/storage/toon/regenerate to create it.' });
        }
        res.json({ success: true, toon });
    } catch (error) {
        console.error('Failed to get toon:', error);
        res.status(500).json({ error: 'Failed to get toon' });
    }
});

export default router;
