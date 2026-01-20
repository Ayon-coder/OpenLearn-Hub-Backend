/**
 * Toon Service
 * Generates and manages the content catalog (Toon) for LLM context
 * 
 * The Toon contains FULL content data so the LLM knows exactly
 * what resources exist on our platform.
 */

import { githubStorageService } from './githubStorageService.js';

const TOON_PATH = 'data/global/toon.json';

/**
 * Generate Toon from the master contents list
 * Contains FULL content data for comprehensive LLM context
 * 
 * @param {Array} contents - Array of content items from contents.json
 * @returns {Object} Toon structure with full content data
 */
export function generateToon(contents) {
    // Build comprehensive content catalog with ALL details
    const contentCatalog = contents.map(content => {
        const org = content.organization || {};

        // Determine the primary category
        let category = 'General';
        let subcategory = 'Uncategorized';
        let topic = null;

        if (org.subjectPath) {
            category = org.subjectPath.subject || 'General';
            subcategory = org.subjectPath.coreTopic || 'Uncategorized';
            topic = org.subjectPath.subtopic || null;
        } else if (org.coursePath) {
            category = org.coursePath.provider || 'Course Platform';
            subcategory = org.coursePath.courseName || 'General Course';
            topic = org.coursePath.topic || null;
        } else if (org.channelPath) {
            category = org.channelPath.channelName || 'YouTube';
            subcategory = org.channelPath.playlistName || 'General';
            topic = org.channelPath.topic || null;
        } else if (org.universityPath) {
            category = org.universityPath.university || 'University';
            subcategory = org.universityPath.subject || 'General';
            topic = org.universityPath.topic || null;
        }

        return {
            id: content.id,
            title: content.title,
            description: content.description,
            category,
            subcategory,
            topic,
            level: content.level || 'Intermediate',
            tags: content.tags || [],
            uploadedBy: content.uploadedBy,
            hasVideo: !!content.videoUrl,
            views: content.views || 0,
            likes: content.likes || 0
        };
    });

    // Group by category for easier LLM understanding
    const categorized = {};
    contentCatalog.forEach(item => {
        if (!categorized[item.category]) {
            categorized[item.category] = {
                name: item.category,
                subcategories: {}
            };
        }

        if (!categorized[item.category].subcategories[item.subcategory]) {
            categorized[item.category].subcategories[item.subcategory] = {
                name: item.subcategory,
                contents: []
            };
        }

        categorized[item.category].subcategories[item.subcategory].contents.push(item);
    });

    // Convert to array format
    const categories = Object.values(categorized).map(cat => ({
        name: cat.name,
        subcategories: Object.values(cat.subcategories).map(sub => ({
            name: sub.name,
            contentCount: sub.contents.length,
            contents: sub.contents
        }))
    }));

    return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalAvailable: contents.length,
        categories,
        // Also include flat list for direct matching
        allContents: contentCatalog
    };
}

/**
 * Regenerate and sync Toon to GitHub
 * Called after new content is uploaded
 */
export async function regenerateToon() {
    try {
        console.log('🔄 Regenerating Toon...');

        // Fetch current contents
        const contents = await githubStorageService.getGlobalData();

        // Generate new toon
        const toon = generateToon(contents);

        // Save to GitHub
        const current = await githubStorageService.getFile(TOON_PATH);
        const sha = current ? current.sha : null;

        await githubStorageService.saveFile(
            TOON_PATH,
            toon,
            `Auto-update Toon: ${contents.length} items`,
            sha
        );

        console.log(`✅ Toon regenerated: ${toon.categories.length} categories, ${toon.totalAvailable} content items`);
        return toon;
    } catch (error) {
        console.error('❌ Toon regeneration failed:', error);
        throw error;
    }
}

/**
 * Get current Toon from GitHub
 * @returns {Object|null} Toon data or null if not found
 */
export async function getToon() {
    try {
        const result = await githubStorageService.getFile(TOON_PATH);
        return result ? result.data : null;
    } catch (error) {
        console.error('Failed to fetch Toon:', error);
        return null;
    }
}

/**
 * Format Toon for LLM prompt
 * Creates comprehensive text representation with ALL content details
 * 
 * @param {Object} toon - Toon data
 * @returns {string} Formatted string for LLM prompt
 */
export function formatToonForPrompt(toon) {
    if (!toon || !toon.allContents) {
        return 'No platform content available.';
    }

    const lines = [
        `=== OPENLEARN HUB CONTENT CATALOG ===`,
        `Total Available Resources: ${toon.totalAvailable}`,
        `Last Updated: ${toon.lastUpdated}`,
        ``,
        `IMPORTANT: When generating learning paths:`,
        `- If a topic EXISTS here → mark as "available" with matching content ID`,
        `- If a topic DOES NOT EXIST → mark as "alternative" for external resources`,
        ``,
        `=== AVAILABLE CONTENT BY CATEGORY ===`,
        ``
    ];

    // List all content with details
    toon.categories.forEach(category => {
        lines.push(`📚 ${category.name.toUpperCase()}`);
        lines.push(`────────────────────────────────────────`);

        category.subcategories.forEach(sub => {
            lines.push(`  📂 ${sub.name} (${sub.contentCount} items)`);

            sub.contents.forEach(content => {
                const tags = content.tags.length > 0 ? ` [${content.tags.slice(0, 5).join(', ')}]` : '';
                const video = content.hasVideo ? ' 🎬' : '';
                lines.push(`     • [${content.id}] "${content.title}" - ${content.level}${video}${tags}`);
            });
            lines.push('');
        });
        lines.push('');
    });

    lines.push(`=== END OF CATALOG ===`);

    return lines.join('\n');
}

export const toonService = {
    generateToon,
    regenerateToon,
    getToon,
    formatToonForPrompt
};
