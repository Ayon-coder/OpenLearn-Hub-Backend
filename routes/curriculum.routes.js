/**
 * Curriculum Routes
 * Handles curriculum generation and retrieval endpoints
 */

import express from 'express';
import { buildCurriculumPrompt, getDefaultFormData } from '../services/curriculumPrompt.js';
import {
    saveCurriculum,
    getCurriculumById,
    getCurriculaByUser,
    deleteCurriculum,
    updateCurriculumProgress
} from '../services/curriculumService.js';

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

        // Build the prompt
        const prompt = buildCurriculumPrompt(completeFormData);

        console.log(`📚 Generating curriculum for user: ${userId}`);
        console.log(`📖 Learning goal: ${formData.learning_goal}`);

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

        // Save to Firestore
        const savedCurriculum = await saveCurriculum(userId, completeFormData, curriculumData);

        console.log(`✅ Curriculum generated and saved: ${savedCurriculum.id}`);

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
 * GET /api/curriculum/:id
 * Get a specific curriculum by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const curriculum = await getCurriculumById(id);

        if (!curriculum) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Curriculum not found'
            });
        }

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
        const { progress } = req.body;

        if (!progress) {
            return res.status(400).json({
                error: 'Missing progress data',
                message: 'Progress data is required'
            });
        }

        const updatedCurriculum = await updateCurriculumProgress(id, progress);

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
