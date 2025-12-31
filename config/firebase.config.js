/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin using base64 encoded service account or JSON file
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp = null;
let firestore = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
    try {
        let serviceAccount;

        // Try base64 encoded credential first
        const base64ServiceAccount = process.env.FIREBASE_CRED_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

        if (base64ServiceAccount) {
            serviceAccount = JSON.parse(
                Buffer.from(base64ServiceAccount, 'base64').toString('utf-8')
            );
            console.log('📦 Using base64 encoded Firebase credentials');
        } else {
            // Fallback to JSON file
            const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
            if (fs.existsSync(keyPath)) {
                const keyContent = fs.readFileSync(keyPath, 'utf-8');
                serviceAccount = JSON.parse(keyContent);
                console.log('📦 Using serviceAccountKey.json file');
            } else {
                throw new Error('No Firebase credentials found. Set FIREBASE_CRED_BASE64 in .env or provide serviceAccountKey.json');
            }
        }

        // Initialize Firebase Admin
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firestore = admin.firestore();

        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log(`📂 Project: ${serviceAccount.project_id}`);

        return { app: firebaseApp, db: firestore };
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error.message);
        throw error;
    }
}

/**
 * Get Firestore instance
 */
export function getFirestore() {
    if (!firestore) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firestore;
}

/**
 * Get Firebase Admin app instance
 */
export function getFirebaseApp() {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebaseApp;
}
