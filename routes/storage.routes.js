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

// POST /api/storage/dedupe - Maintenance route to remove duplicates
router.post('/dedupe', async (req, res) => {
    try {
        console.log('🧹 Starting deduplication...');
        const path = 'data/global/contents.json';
        const current = await githubStorageService.getFile(path);

        if (!current || !current.data) {
            return res.json({ message: 'No global content found to dedupe.' });
        }

        const originalData = current.data;
        const seen = new Set();
        const cleanData = [];

        // Keep only the first occurrence of each ID
        for (const item of originalData) {
            if (!seen.has(item.id)) {
                seen.add(item.id);
                cleanData.push(item);
            }
        }

        const removedCount = originalData.length - cleanData.length;

        if (removedCount === 0) {
            console.log('✅ No duplicates found.');
            return res.json({ success: true, message: 'No duplicates found', count: cleanData.length });
        }

        console.log(`⚠️ Found ${removedCount} duplicates. Cleaning up...`);
        await githubStorageService.saveFile(path, cleanData, `Cleanup: Removed ${removedCount} duplicate entries`, current.sha);

        res.json({
            success: true,
            message: `Removed ${removedCount} duplicates`,
            originalCount: originalData.length,
            newCount: cleanData.length
        });
    } catch (error) {
        console.error('❌ Deduplication failed:', error);
        res.status(500).json({ error: 'Deduplication failed', details: error.message });
    }
});

export default router;
