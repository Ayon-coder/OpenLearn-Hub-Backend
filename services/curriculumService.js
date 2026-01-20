/**
 * Curriculum Service
 * Handles GitHub storage operations for curriculum/learning path management
 * 
 * Storage Structure:
 * - data/users/{userId}/curricula.json - Array of all curricula for a user
 */

import { githubStorageService } from './githubStorageService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the path for a user's curricula file
 */
function getCurriculaPath(userId) {
    return `data/users/${userId}/curricula.json`;
}

/**
 * Load Master Curriculum Data (for validation)
 * @returns {Object} Master curriculum data
 */
function getMasterCurriculum() {
    try {
        const masterPath = path.join(__dirname, '../data/master_curriculum.json');
        if (fs.existsSync(masterPath)) {
            const rawData = fs.readFileSync(masterPath, 'utf8');
            return JSON.parse(rawData);
        }
        return { cards: [] };
    } catch (error) {
        console.warn('Failed to load validation master:', error);
        return { cards: [] };
    }
}

/**
 * Validate and Snap Curriculum to Master Repository
 * Also marks items as "available" or "alternative" for UI display
 * @param {Object} llmCurriculum - The raw curriculum from AI
 * @returns {Object} Validated curriculum
 */
export async function validateCurriculumResult(llmCurriculum) {
    const masterData = getMasterCurriculum();
    const masterCards = masterData.cards || [];

    // Also load global contents for real content matching
    let globalContents = [];
    try {
        globalContents = await githubStorageService.getGlobalData() || [];
    } catch (e) {
        console.warn('Could not load global contents for matching:', e);
    }

    // Helper to find best match in master cards
    const findMasterCard = (topicSlug, title) => {
        const slugMatch = masterCards.find(c => c.id === topicSlug);
        if (slugMatch) return slugMatch;

        const titleMatch = masterCards.find(c => c.topic.toLowerCase() === title.toLowerCase());
        if (titleMatch) return titleMatch;

        return masterCards.find(c =>
            title.toLowerCase().includes(c.topic.toLowerCase()) ||
            c.topic.toLowerCase().includes(title.toLowerCase())
        );
    };

    // Helper to find matching content in global contents
    const findMatchingContent = (title, keywords = [], providedId = null) => {
        // 1. First priority: Check the ID provided by LLM
        if (providedId) {
            const idMatch = globalContents.find(c => c.id === providedId);
            if (idMatch) return idMatch;
        }

        const titleLower = title.toLowerCase();

        // 2. Second priority: STRICT Title Match only
        return globalContents.find(content => {
            const contentTitle = (content.title || '').toLowerCase();
            return contentTitle === titleLower || contentTitle.includes(titleLower) && titleLower.length > 10; // Only match substring if title is substantial
        });
    };

    const validated = { ...llmCurriculum };
    if (!validated.curriculum) return validated;

    // Process each tier
    ['beginner', 'intermediate', 'advanced'].forEach(tier => {
        if (validated.curriculum[tier] && validated.curriculum[tier].courses) {
            validated.curriculum[tier].courses = validated.curriculum[tier].courses.map(course => {
                const criteria = course.matching_criteria || {};

                // Use strict matching
                const matchedContent = findMatchingContent(
                    course.title,
                    criteria.keywords || [],
                    criteria.matched_content_id // Pass the ID from LLM
                );

                if (matchedContent) {
                    // AVAILABLE: Found in our platform content
                    return {
                        ...course,
                        title: matchedContent.title || course.title, // Sync title
                        matching_criteria: {
                            ...criteria,
                            validation_status: "available",
                            matched_content_id: matchedContent.id,
                            matched_content_title: matchedContent.title,
                            content_url: `/notes/${matchedContent.id}`
                        }
                    };
                } else {
                    // ALTERNATIVE: Not in our platform - suggest external
                    const searchQuery = encodeURIComponent(`${course.title} tutorial`);
                    return {
                        ...course,
                        matching_criteria: {
                            ...criteria,
                            validation_status: "alternative",
                            matched_content_id: null, // Clear any invalid ID
                            note: "Not available on OpenLearn Hub - External resources suggested",
                            external_links: [
                                {
                                    platform: "YouTube",
                                    url: `https://www.youtube.com/results?search_query=${searchQuery}`,
                                    icon: "youtube"
                                },
                                {
                                    platform: "Coursera",
                                    url: `https://www.coursera.org/search?query=${searchQuery}`,
                                    icon: "graduation-cap"
                                },
                                {
                                    platform: "freeCodeCamp",
                                    url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(course.title)}`,
                                    icon: "code"
                                }
                            ]
                        }
                    };
                }
            });
        }
    });

    return validated;
}


/**
 * Save a generated curriculum to GitHub
 * @param {string} userId - User ID who generated the curriculum
 * @param {Object} formData - Original form data used to generate
 * @param {Object} curriculumData - Generated curriculum from AI
 * @returns {Promise<Object>} Saved curriculum document
 */
export async function saveCurriculum(userId, formData, curriculumData) {
    try {
        const curriculaPath = getCurriculaPath(userId);

        // Generate unique ID
        const curriculumId = `curriculum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const curriculum = {
            id: curriculumId,
            userId,
            formData,
            curriculum: curriculumData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Get existing curricula
        const existing = await githubStorageService.getFile(curriculaPath);
        const curricula = existing ? existing.data : [];
        const sha = existing ? existing.sha : null;

        // Add new curriculum at the beginning
        curricula.unshift(curriculum);

        // Save to GitHub
        await githubStorageService.saveFile(
            curriculaPath,
            curricula,
            `Add curriculum: ${formData.learning_goal?.substring(0, 50) || 'New learning path'}`,
            sha
        );

        console.log(`✅ Curriculum saved to GitHub: ${curriculumId}`);

        return curriculum;
    } catch (error) {
        console.error('❌ Save curriculum failed:', error);
        throw new Error(`Save curriculum failed: ${error.message}`);
    }
}

/**
 * Get curriculum by ID
 * @param {string} curriculumId - Curriculum document ID
 * @returns {Promise<Object|null>} Curriculum document or null
 */
export async function getCurriculumById(curriculumId) {
    try {
        // Extract userId from curriculum ID format or search all users
        // For now, we need to search - in production you'd include userId in the request

        // Try to find in the provided curriculumId path pattern
        // Format: curriculum_timestamp_randomstring
        // We need to search through user directories

        // Alternative: Store a global index or include userId in requests
        // For now, return null and let the caller handle it
        console.log(`[DEBUG] getCurriculumById called with: ${curriculumId}`);

        // The frontend should pass userId as well, but as fallback we return null
        // This will be improved when we add proper routing with userId
        return null;
    } catch (error) {
        console.error('❌ Get curriculum by ID failed:', error);
        throw new Error(`Get curriculum by ID failed: ${error.message}`);
    }
}

/**
 * Get curriculum by ID with userId (preferred method)
 * @param {string} userId - User ID
 * @param {string} curriculumId - Curriculum ID
 * @returns {Promise<Object|null>} Curriculum document or null
 */
export async function getCurriculumByIdForUser(userId, curriculumId) {
    try {
        const curriculaPath = getCurriculaPath(userId);
        const result = await githubStorageService.getFile(curriculaPath);

        if (!result) return null;

        const curricula = result.data || [];
        return curricula.find(c => c.id === curriculumId) || null;
    } catch (error) {
        console.error('❌ Get curriculum failed:', error);
        throw new Error(`Get curriculum failed: ${error.message}`);
    }
}

/**
 * Get all curricula for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of curriculum documents
 */
export async function getCurriculaByUser(userId) {
    try {
        const curriculaPath = getCurriculaPath(userId);
        const result = await githubStorageService.getFile(curriculaPath);

        if (!result) {
            return [];
        }

        const curricula = result.data || [];

        // Sort by createdAt descending (newest first)
        curricula.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return curricula;
    } catch (error) {
        console.error('❌ Get curricula by user failed:', error);
        throw new Error(`Get curricula by user failed: ${error.message}`);
    }
}

/**
 * Delete a curriculum
 * @param {string} curriculumId - Curriculum ID to delete
 * @param {string} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteCurriculum(curriculumId, userId) {
    try {
        const curriculaPath = getCurriculaPath(userId);
        const result = await githubStorageService.getFile(curriculaPath);

        if (!result) {
            throw new Error('Curriculum not found');
        }

        const curricula = result.data || [];
        const index = curricula.findIndex(c => c.id === curriculumId);

        if (index === -1) {
            throw new Error('Curriculum not found');
        }

        // Remove the curriculum
        curricula.splice(index, 1);

        // Save back to GitHub
        await githubStorageService.saveFile(
            curriculaPath,
            curricula,
            `Delete curriculum: ${curriculumId}`,
            result.sha
        );

        console.log(`✅ Curriculum deleted: ${curriculumId}`);
        return true;
    } catch (error) {
        console.error('❌ Delete curriculum failed:', error);
        throw new Error(`Delete curriculum failed: ${error.message}`);
    }
}

/**
 * Update curriculum progress
 * @param {string} curriculumId - Curriculum ID
 * @param {string} userId - User ID
 * @param {Object} progressData - Progress update data
 * @returns {Promise<Object>} Updated curriculum
 */
export async function updateCurriculumProgress(curriculumId, userId, progressData) {
    try {
        const curriculaPath = getCurriculaPath(userId);
        const result = await githubStorageService.getFile(curriculaPath);

        if (!result) {
            throw new Error('Curriculum not found');
        }

        const curricula = result.data || [];
        const index = curricula.findIndex(c => c.id === curriculumId);

        if (index === -1) {
            throw new Error('Curriculum not found');
        }

        // Update progress
        curricula[index].progress = progressData;
        curricula[index].updatedAt = new Date().toISOString();

        // Save back to GitHub
        await githubStorageService.saveFile(
            curriculaPath,
            curricula,
            `Update progress: ${curriculumId}`,
            result.sha
        );

        return curricula[index];
    } catch (error) {
        console.error('❌ Update curriculum progress failed:', error);
        throw new Error(`Update curriculum progress failed: ${error.message}`);
    }
}
