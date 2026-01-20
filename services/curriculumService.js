/**
 * Curriculum Service
 * Handles all Firestore operations for curriculum management
 */

import { getFirestore } from '../config/firebase.config.js';

const CURRICULA_COLLECTION = 'curricula';

/**
 * Save a generated curriculum to Firestore
 * @param {string} userId - User ID who generated the curriculum
 * @param {Object} formData - Original form data used to generate
 * @param {Object} curriculumData - Generated curriculum from AI
 * @returns {Promise<Object>} Saved curriculum document
 */
export async function saveCurriculum(userId, formData, curriculumData) {
    try {
        const db = getFirestore();
        const curriculumRef = db.collection(CURRICULA_COLLECTION).doc();

        const curriculum = {
            userId,
            formData,
            curriculum: curriculumData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await curriculumRef.set(curriculum);

        console.log(`✅ Curriculum saved: ${curriculumRef.id}`);

        return {
            id: curriculumRef.id,
            ...curriculum
        };
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
        const db = getFirestore();
        const doc = await db.collection(CURRICULA_COLLECTION).doc(curriculumId).get();

        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Get curriculum by ID failed:', error);
        throw new Error(`Get curriculum by ID failed: ${error.message}`);
    }
}

/**
 * Get all curricula for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of curriculum documents
 */
export async function getCurriculaByUser(userId) {
    try {
        const db = getFirestore();
        // Note: Removed orderBy to avoid requiring composite index
        // Sorting client-side instead
        const snapshot = await db.collection(CURRICULA_COLLECTION)
            .where('userId', '==', userId)
            .get();

        const curricula = [];
        snapshot.forEach(doc => {
            curricula.push({
                id: doc.id,
                ...doc.data()
            });
        });

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
        const db = getFirestore();
        const curriculumRef = db.collection(CURRICULA_COLLECTION).doc(curriculumId);

        // Verify ownership
        const doc = await curriculumRef.get();
        if (!doc.exists) {
            throw new Error('Curriculum not found');
        }

        if (doc.data().userId !== userId) {
            throw new Error('Unauthorized: You can only delete your own curricula');
        }

        await curriculumRef.delete();
        console.log(`✅ Curriculum deleted: ${curriculumId}`);

        return true;
    } catch (error) {
        console.error('❌ Delete curriculum failed:', error);
        throw new Error(`Delete curriculum failed: ${error.message}`);
    }
}

/**
 * Update curriculum progress (for tracking user's learning progress)
 * @param {string} curriculumId - Curriculum ID
 * @param {Object} progressData - Progress update data
 * @returns {Promise<Object>} Updated curriculum
 */
export async function updateCurriculumProgress(curriculumId, progressData) {
    try {
        const db = getFirestore();
        const curriculumRef = db.collection(CURRICULA_COLLECTION).doc(curriculumId);

        await curriculumRef.update({
            progress: progressData,
            updatedAt: new Date().toISOString()
        });

        const updatedDoc = await curriculumRef.get();
        return {
            id: curriculumId,
            ...updatedDoc.data()
        };
    } catch (error) {
        console.error('❌ Update curriculum progress failed:', error);
        throw new Error(`Update curriculum progress failed: ${error.message}`);
    }
}
