/**
 * Curriculum Routes
 * Handles curriculum generation and retrieval endpoints
 */

import express from 'express';
import { buildCurriculumPrompt, getDefaultFormData } from '../services/curriculumPrompt.js';
import {
    saveCurriculum,
    getCurriculumById,
    getCurriculumByIdForUser,
    getCurriculaByUser,
    deleteCurriculum,
    updateCurriculumProgress,
    validateCurriculumResult
} from '../services/curriculumService.js';
import { getToon, formatToonForPrompt, regenerateToon } from '../services/toonService.js';

const router = express.Router();

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * POST /api/curriculum/generate
 * Generate a personalized curriculum using Groq AI
 */
router.post('/generate', async (req, res) => {
    try {
        const { userId, ...formData } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID',
                message: 'User ID is required to save curriculum'
            });
        }

        if (!formData.learning_goal) {
            return res.status(400).json({
                error: 'Missing learning goal',
                message: 'Please specify what you want to learn'
            });
        }

        // Check for Groq API key
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
            return res.status(500).json({
                error: 'API key not configured',
                message: 'Groq API key is not configured. Please set GROQ_API_KEY in .env'
            });
        }

        // Merge with defaults
        const completeFormData = { ...getDefaultFormData(), ...formData };

        // Fetch the toon (content catalog) for LLM context
        let toon = await getToon();
        if (!toon) {
            console.log('📦 Toon not found, regenerating...');
            toon = await regenerateToon();
        }
        const toonContext = formatToonForPrompt(toon);

        // Build the prompt with toon context
        const basePrompt = buildCurriculumPrompt(completeFormData);
        const prompt = `${toonContext}\n\n---\n\n${basePrompt}`;

        console.log(`📚 Generating curriculum for user: ${userId}`);
        console.log(`📖 Learning goal: ${formData.learning_goal}`);
        console.log(`📦 Toon context: ${toon.totalAvailable} items loaded`);

        // Call Groq API
        const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json().catch(() => ({}));
            console.error('Groq API error:', errorData);
            throw new Error(errorData.error?.message || `Groq API error: ${groqResponse.status}`);
        }

        const groqData = await groqResponse.json();
        const aiContent = groqData.choices[0]?.message?.content;

        if (!aiContent) {
            throw new Error('No content received from AI');
        }

        // Parse the JSON response
        let curriculumData;
        try {
            // Clean the response (remove potential markdown code blocks)
            let cleanContent = aiContent.trim();
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.slice(7);
            }
            if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.slice(3);
            }
            if (cleanContent.endsWith('```')) {
                cleanContent = cleanContent.slice(0, -3);
            }
            curriculumData = JSON.parse(cleanContent.trim());
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.error('Raw content:', aiContent.substring(0, 500));
            throw new Error('Failed to parse curriculum data from AI response');
        }

        // Validate and mark available vs alternative content
        const validatedCurriculumData = await validateCurriculumResult(curriculumData);
        console.log('✅ Validation complete: Matched against platform content');

        // Save to GitHub
        const savedCurriculum = await saveCurriculum(userId, completeFormData, validatedCurriculumData);

        console.log(`✅ Curriculum generated and saved to GitHub: ${savedCurriculum.id}`);

        res.json({
            success: true,
            message: 'Curriculum generated successfully',
            curriculum: savedCurriculum
        });

    } catch (error) {
        console.error('Curriculum generation error:', error);
        res.status(500).json({
            error: 'Generation failed',
            message: error.message || 'Failed to generate curriculum'
        });
    }
});

/**
 * GET /api/curriculum/user/:userId
 * Get all curricula for a specific user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const curricula = await getCurriculaByUser(userId);

        res.json({
            success: true,
            count: curricula.length,
            curricula
        });
    } catch (error) {
        console.error('Get user curricula error:', error);
        res.status(500).json({
            error: 'Fetch failed',
            message: error.message
        });
    }
});

/**
 * GET /api/curriculum/:userId/:id
 * Get a specific curriculum by ID for a user
 */
router.get('/:userId/:id', async (req, res) => {
    try {
        const { userId, id } = req.params;
        console.log(`[DEBUG] Fetching curriculum ID: ${id} for user: ${userId}`);

        const curriculum = await getCurriculumByIdForUser(userId, id);

        if (!curriculum) {
            console.log(`[DEBUG] Curriculum ID ${id} NOT FOUND.`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Curriculum not found'
            });
        }
        console.log(`[DEBUG] Found curriculum ID ${id}`);

        res.json({
            success: true,
            curriculum
        });
    } catch (error) {
        console.error('Get curriculum error:', error);
        res.status(500).json({
            error: 'Fetch failed',
            message: error.message
        });
    }
});

/**
 * DELETE /api/curriculum/:id
 * Delete a curriculum
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID',
                message: 'User ID is required for authorization'
            });
        }

        await deleteCurriculum(id, userId);

        res.json({
            success: true,
            message: 'Curriculum deleted successfully'
        });
    } catch (error) {
        console.error('Delete curriculum error:', error);
        res.status(500).json({
            error: 'Delete failed',
            message: error.message
        });
    }
});

/**
 * PATCH /api/curriculum/:id/progress
 * Update curriculum progress
 */
router.patch('/:id/progress', async (req, res) => {
    try {
        const { id } = req.params;
        const { progress, userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID',
                message: 'User ID is required to update progress'
            });
        }

        if (!progress) {
            return res.status(400).json({
                error: 'Missing progress data',
                message: 'Progress data is required'
            });
        }

        const updatedCurriculum = await updateCurriculumProgress(id, userId, progress);

        res.json({
            success: true,
            message: 'Progress updated successfully',
            curriculum: updatedCurriculum
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            error: 'Update failed',
            message: error.message
        });
    }
});

export default router;
