import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory (parent of scripts/)
dotenv.config({ path: path.join(__dirname, '../.env') });

const initGlobalContent = async () => {
    try {
        console.log('Loading configuration...');
        const { githubStorageService } = await import('../services/githubStorageService.js');
        const { githubConfig } = await import('../config/github.config.js');

        console.log('Configuration Loaded:', {
            owner: githubConfig.owner,
            repo: githubConfig.repo,
            branch: githubConfig.branch,
            tokenPresent: !!githubConfig.token
        });

        console.log('Reading seed content...');
        const seedPath = path.join(__dirname, '../data/seed_contents.json');
        const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

        console.log(`Found ${seedData.length} items. Uploading to GitHub...`);

        // Use saveFile directly since we don't need a wrapper for this one-off
        await githubStorageService.saveFile(
            'data/global/contents.json',
            seedData,
            'Initialize global content with demo data'
        );

        console.log('SUCCESS: Global content initialized in GitHub repository.');
    } catch (error) {
        console.error('ERROR: Failed to initialize global content:', error);
        process.exit(1);
    }
};

initGlobalContent();
