/**
 * User Service
 * Handles all Firestore operations for user management
 */

import { getFirestore } from '../config/firebase.config.js';

const USERS_COLLECTION = 'users';

/**
 * Create a new user in Firestore
 * @param {Object} userData - User data from registration
 * @returns {Promise<Object>} Created user document
 */
export async function createUser(userData) {
    try {
        const db = getFirestore();
        const userRef = db.collection(USERS_COLLECTION).doc();

        const user = {
            ...userData,
            approved: false, // Always start with approved: false
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await userRef.set(user);

        console.log(`✅ User created: ${userRef.id}`);

        return {
            id: userRef.id,
            ...user
        };
    } catch (error) {
        console.error('❌ Create user failed:', error);
        throw new Error(`Create user failed: ${error.message}`);
    }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User document or null
 */
export async function getUserByEmail(email) {
    try {
        const db = getFirestore();
        const snapshot = await db.collection(USERS_COLLECTION)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Get user by email failed:', error);
        throw new Error(`Get user by email failed: ${error.message}`);
    }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User document or null
 */
export async function getUserById(userId) {
    try {
        const db = getFirestore();
        const doc = await db.collection(USERS_COLLECTION).doc(userId).get();

        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Get user by ID failed:', error);
        throw new Error(`Get user by ID failed: ${error.message}`);
    }
}

/**
 * Get all users (for admin dashboard)
 * @returns {Promise<Array>} All user documents
 */
export async function getAllUsers() {
    try {
        const db = getFirestore();
        const snapshot = await db.collection(USERS_COLLECTION).get();

        const users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('❌ Get all users failed:', error);
        throw new Error(`Get all users failed: ${error.message}`);
    }
}

/**
 * Get pending users (approved === false)
 * @returns {Promise<Array>} Pending user documents
 */
export async function getPendingUsers() {
    try {
        const db = getFirestore();
        const snapshot = await db.collection(USERS_COLLECTION)
            .where('approved', '==', false)
            .get();

        const users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('❌ Get pending users failed:', error);
        throw new Error(`Get pending users failed: ${error.message}`);
    }
}

/**
 * Get approved users (approved === true)
 * @returns {Promise<Array>} Approved user documents
 */
export async function getApprovedUsers() {
    try {
        const db = getFirestore();
        const snapshot = await db.collection(USERS_COLLECTION)
            .where('approved', '==', true)
            .get();

        const users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('❌ Get approved users failed:', error);
        throw new Error(`Get approved users failed: ${error.message}`);
    }
}

/**
 * Approve a user (atomic update - only changes approved field)
 * @param {string} userId - User ID to approve
 * @returns {Promise<Object>} Updated user document
 */
export async function approveUser(userId) {
    try {
        const db = getFirestore();
        const userRef = db.collection(USERS_COLLECTION).doc(userId);

        // Get current user to check if already approved
        const doc = await userRef.get();
        if (!doc.exists) {
            throw new Error('User not found');
        }

        const userData = doc.data();

        // Check if already approved (prevent duplicate emails)
        if (userData.approved === true) {
            return {
                id: userId,
                ...userData,
                alreadyApproved: true
            };
        }

        // Atomic update - only update approved field and timestamp
        await userRef.update({
            approved: true,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log(`✅ User approved: ${userId}`);

        // Return updated user
        const updatedDoc = await userRef.get();
        return {
            id: userId,
            ...updatedDoc.data(),
            alreadyApproved: false
        };
    } catch (error) {
        console.error('❌ Approve user failed:', error);
        throw new Error(`Approve user failed: ${error.message}`);
    }
}

/**
 * Check if email is already registered
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
export async function emailExists(email) {
    const user = await getUserByEmail(email);
    return user !== null;
}
