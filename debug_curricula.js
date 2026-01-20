import { initializeFirebase, getFirestore } from './config/firebase.config.js';
import dotenv from 'dotenv';
dotenv.config();

async function listCurricula() {
    try {
        console.log('Initializing Firebase...');
        initializeFirebase();
        const db = getFirestore();
        console.log('Querying curricula collection...');

        const snapshot = await db.collection('curricula')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log('No curricula found.');
            return;
        }

        const doc = snapshot.docs[0];
        console.log(`LATEST_ID:${doc.id}`);
        console.log(`CREATED:${doc.data().createdAt}`);

    } catch (error) {
        console.error('Error listing curricula:', error);
    }
}

listCurricula();
