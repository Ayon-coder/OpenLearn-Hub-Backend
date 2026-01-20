
const DEMO_CONTENTS = [
    {
        id: 'dsa_1',
        title: 'Array Implementation in C',
        tags: ['C', 'Arrays', 'Data Structures', 'Programming'],
        level: 'Beginner'
    },
    {
        id: 'content_6',
        title: 'Machine Learning Basics',
        tags: ['Computer Science', 'Artificial Intelligence', 'Machine Learning', 'Introduction to Machine Learning', 'ML Basics Lecture Notes', 'Supervised Learning'],
        level: 'Introduction'

    }
];

function findPlatformContent(topics, title, level) {
    const STOP_WORDS = new Set([
        'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'introduction', 'intro', 'basics', 'basic', 'advanced', 'complete', 'guide',
        'tutorial', 'course', 'learn', 'learning', 'how', 'what', 'why', 'programming',
        'development', 'design', 'engineering', 'science', 'scratch', 'zero', 'hero',
        'mastery', 'bootcamp', 'full', 'stack', 'concepts', 'principles'
    ]);

    const getKeywords = (text) => {
        return text.join(' ').toLowerCase()
            .replace(/-/g, ' ')
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    };

    let courseKeywords = new Set(getKeywords([title, ...topics]));
    console.log('Course Keywords:', [...courseKeywords]);

    const scoredContent = DEMO_CONTENTS.map(content => {
        let score = 0;
        const contentKeywords = getKeywords([content.title, ...(content.tags || [])]);

        let matches = [];
        contentKeywords.forEach(word => {
            if (courseKeywords.has(word)) {
                matches.push(word);
                score += 10;
            }
        });

        const contentTitleLower = content.title.toLowerCase();
        const courseTitleLower = title.toLowerCase();
        if (contentTitleLower.includes(courseTitleLower) || courseTitleLower.includes(contentTitleLower)) {
            score += 20;
            console.log(`Title Match Bonus for "${content.title}"`);
        }

        return { title: content.title, score, matches };
    });

    return scoredContent;
}

const topics = ['Computer Science', 'Artificial Intelligence']; // Likely topics for ML
const title = 'Introduction to Machine Learning';

console.log('--- Matching "Introduction to Machine Learning" ---');
const results = findPlatformContent(topics, title, 'Beginner');
console.log(JSON.stringify(results, null, 2));
