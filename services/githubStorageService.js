import { octokit, githubConfig } from '../config/github.config.js';

const { owner, repo, branch } = githubConfig;

// Helper to decode Base64 content from GitHub
const decodeContent = (content) => {
    return Buffer.from(content, 'base64').toString('utf-8');
};

// Helper to encode content to Base64
const encodeContent = (content) => {
    return Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
};

export const githubStorageService = {
    /**
     * Get file content from GitHub
     * @param {string} path - File path in the repo (e.g., 'data/global/contents.json')
     * @returns {Promise<Object|null>} Parsed JSON content or null if not found
     */
    async getFile(path) {
        try {
            const response = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch
            });

            if (Array.isArray(response.data)) {
                throw new Error('Path points to a directory, not a file');
            }

            const content = decodeContent(response.data.content);

            if (!content || content.trim().length === 0) {
                console.warn(`File ${path} is empty, returning null`);
                return null;
            }

            try {
                return {
                    data: JSON.parse(content),
                    sha: response.data.sha // Needed for updates
                };
            } catch (parseError) {
                console.warn(`File ${path} contains invalid JSON, treating as missing/corrupted:`, parseError.message);
                // Return null so we can overwrite/regenerate it
                return null;
            }
        } catch (error) {
            if (error.status === 404) {
                return null; // File doesn't exist
            }
            console.error(`Error fetching file ${path} from GitHub:`, error);
            throw error;
        }
    },

    /**
     * Create or Update a file in GitHub
     * @param {string} path - File path
     * @param {Object} content - JSON content to save
     * @param {string} message - Commit message
     * @param {string} [sha] - Blob SHA (required for updates, omitted for creation)
     */
    async saveFile(path, content, message, sha = null) {
        try {
            const params = {
                owner,
                repo,
                path,
                message,
                content: encodeContent(content),
                branch
            };

            if (sha) {
                params.sha = sha;
            }

            await octokit.repos.createOrUpdateFileContents(params);
            console.log(`Successfully saved ${path} to GitHub`);
        } catch (error) {
            console.error(`Error saving file ${path} to GitHub:`, error);
            throw error;
        }
    },

    /**
     * Get global content (Trending/Browse)
     */
    async getGlobalData() {
        const path = 'data/global/contents.json';
        const result = await this.getFile(path);
        return result ? result.data : [];
    },

    /**
     * Get user-specific profile data (Uploads/Downloads)
     * Creates a default profile if it doesn't exist.
     */
    async getUserData(userId) {
        const path = `data/users/${userId}/profile.json`;
        let result = await this.getFile(path);

        if (!result) {
            // Create default profile for new user
            const defaultProfile = {
                userId,
                uploads: [],
                downloads: [],
                createdAt: new Date().toISOString()
            };
            await this.saveFile(path, defaultProfile, `Create profile for user ${userId}`);
            return defaultProfile;
        }

        return result.data;
    },

    /**
     * Update user-specific profile data
     */
    async updateUserData(userId, data) {
        const path = `data/users/${userId}/profile.json`;
        // We need the SHA to update, so fetch first
        const current = await this.getFile(path);
        const sha = current ? current.sha : null;

        await this.saveFile(path, data, `Update profile for user ${userId}`, sha);
        return data;
    },

    /**
     * Add a new item to the global content list
     */
    async addToGlobalData(contentItem) {
        const path = 'data/global/contents.json';
        const current = await this.getFile(path);

        const existingData = current ? current.data : [];
        const sha = current ? current.sha : null;

        // Prepend new item
        const newData = [contentItem, ...existingData];

        await this.saveFile(path, newData, `Add new global content: ${contentItem.title}`, sha);
        return newData;
    }
};
