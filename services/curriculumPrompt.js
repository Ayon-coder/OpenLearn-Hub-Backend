/**
 * Curriculum Prompt Builder
 * Contains the AI prompt template for generating personalized learning curricula
 */

/**
 * Build the curriculum generation prompt with user data
 * @param {Object} formData - User's learning preferences
 * @returns {string} Complete prompt for AI
 */
export function buildCurriculumPrompt(formData) {
    const prompt = `You are an expert learning curriculum architect. You will receive student information and generate a complete, personalized learning roadmap.

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON - no markdown, no code blocks, no extra text
2. Keep response under 4000 tokens to avoid timeouts
3. Be specific and actionable in every recommendation
4. Generate realistic, achievable learning paths

INPUT DATA:
{
  "learning_goal": "${formData.learning_goal || ''}",
  "current_level": "${formData.current_level || 'Beginner'}",
  "focus_areas": ${JSON.stringify(formData.focus_areas || [])},
  "prior_knowledge": "${formData.prior_knowledge || 'None'}",
  "time_commitment": "${formData.time_commitment || '10-20 hours/week'}",
  "learning_objectives": "${formData.learning_objectives || ''}",
  "learning_style": "${formData.learning_style || 'mixed'}"
}

YOUR TASK:
Analyze the student's profile and create a structured learning path with three difficulty tiers: Beginner, Intermediate, and Advanced.

RESPONSE FORMAT (JSON ONLY):
{
  "student_analysis": {
    "profile_summary": "2-3 sentences analyzing student's background, goals, and readiness",
    "starting_tier": "Beginner|Intermediate|Advanced",
    "reasoning": "Why this starting point based on their prior knowledge",
    "estimated_completion_weeks": 12,
    "weekly_hours_needed": 10
  },
  
  "learning_path": {
    "beginner": {
      "tier_description": "What students will master in this tier",
      "total_videos": 25,
      "estimated_hours": 30,
      "courses": [
        {
          "position": 1,
          "title": "Course Name",
          "description": "What this course teaches and why it's important",
          "topics": ["Topic 1", "Topic 2", "Topic 3"],
          "video_count": 8,
          "duration_hours": 10,
          "prerequisites": ["None" or "Course name"],
          "learning_outcomes": [
            "Specific skill student will gain",
            "Another specific skill"
          ],
          "quiz": [
            {
              "question": "Clear, specific question testing understanding",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer": "Option B",
              "explanation": "Why this answer is correct and why others are wrong"
            },
            {
              "question": "Another question",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "C",
              "explanation": "Detailed explanation"
            },
            {
              "question": "Third question",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "A",
              "explanation": "Detailed explanation"
            }
          ],
          "hands_on_project": "Specific project to build after this course"
        }
      ]
    },
    
    "intermediate": {
      "tier_description": "What students will master in this tier",
      "total_videos": 30,
      "estimated_hours": 40,
      "courses": [
        {
          "position": 1,
          "title": "Course Name",
          "description": "Detailed description",
          "topics": ["Topic 1", "Topic 2"],
          "video_count": 10,
          "duration_hours": 12,
          "prerequisites": ["Beginner course names"],
          "learning_outcomes": ["Outcome 1", "Outcome 2"],
          "quiz": [
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "B",
              "explanation": "Explanation"
            },
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "C",
              "explanation": "Explanation"
            },
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "A",
              "explanation": "Explanation"
            }
          ],
          "hands_on_project": "Project description"
        }
      ]
    },
    
    "advanced": {
      "tier_description": "What students will master in this tier",
      "total_videos": 20,
      "estimated_hours": 35,
      "courses": [
        {
          "position": 1,
          "title": "Course Name",
          "description": "Detailed description",
          "topics": ["Topic 1", "Topic 2"],
          "video_count": 7,
          "duration_hours": 12,
          "prerequisites": ["Intermediate course names"],
          "learning_outcomes": ["Outcome 1", "Outcome 2"],
          "quiz": [
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "D",
              "explanation": "Explanation"
            },
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "B",
              "explanation": "Explanation"
            },
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "C",
              "explanation": "Explanation"
            }
          ],
          "hands_on_project": "Capstone project description"
        }
      ]
    }
  },
  
  "progress_milestones": [
    {
      "milestone_name": "Foundation Complete",
      "tier": "beginner",
      "percentage": 30,
      "videos_completed": 25,
      "skills_unlocked": ["Skill 1", "Skill 2", "Skill 3"],
      "next_step": "What to do after reaching this milestone"
    },
    {
      "milestone_name": "Intermediate Mastery",
      "tier": "intermediate",
      "percentage": 70,
      "videos_completed": 55,
      "skills_unlocked": ["Skill 4", "Skill 5"],
      "next_step": "What to do next"
    },
    {
      "milestone_name": "Expert Level",
      "tier": "advanced",
      "percentage": 100,
      "videos_completed": 75,
      "skills_unlocked": ["Skill 6", "Skill 7"],
      "next_step": "Career/project recommendations"
    }
  ],
  
  "personalization": {
    "skipped_content": ["Topics skipped based on prior knowledge"],
    "emphasized_areas": ["Areas emphasized based on learning objectives"],
    "recommended_pace": "Fast-track|Standard|Relaxed - based on time commitment",
    "learning_style_adaptations": "How curriculum adapts to their learning style preference"
  },
  
  "final_project": {
    "title": "Capstone Project Name",
    "description": "Comprehensive final project that demonstrates mastery",
    "skills_demonstrated": ["All major skills learned"],
    "estimated_hours": 20,
    "deliverables": ["What student will build/create"]
  },
  
  "career_outcomes": {
    "job_titles": ["Possible job titles after completion"],
    "portfolio_pieces": ["Projects to showcase"],
    "next_learning_paths": ["Advanced topics to explore next"]
  }
}

STRICT REQUIREMENTS:

1. COURSE GENERATION:
   - Beginner tier: 3-5 courses minimum
   - Intermediate tier: 3-5 courses minimum
   - Advanced tier: 2-4 courses minimum
   - Each course MUST have exactly 3 quiz questions
   - Each quiz question MUST have exactly 4 options
   - Video counts should be realistic (5-15 videos per course)

2. ADAPTATION RULES:
   - If prior_knowledge includes programming: Skip programming fundamentals
   - If current_level is "Intermediate": Start from intermediate tier
   - If current_level is "Advanced": Focus more on advanced tier, less on beginner
   - If current_level is "Beginner": Make beginner tier comprehensive
   - If learning_style is "hands-on": Include more projects, fewer theory videos
   - If learning_style is "video-heavy": Include more instructional content
   - If time_commitment is low (<5 hours/week): Reduce total course load

3. QUIZ QUALITY:
   - Questions must test understanding, not just memorization
   - Include scenario-based questions when possible
   - Avoid obvious answers
   - Explanations must teach, not just confirm correctness
   - Cover different difficulty levels within each course

4. TOPIC-SPECIFIC GUIDELINES:

   For WEB DEVELOPMENT:
   - Beginner: HTML, CSS, JavaScript fundamentals, Git, Responsive design
   - Intermediate: Framework (React/Vue), APIs, Backend basics (Node.js), Databases
   - Advanced: Full-stack architecture, Authentication, Deployment, Performance, Security

   For DATA SCIENCE:
   - Beginner: Python, NumPy, Pandas, Data visualization, Statistics basics
   - Intermediate: Machine Learning, SQL, Feature engineering, Model evaluation
   - Advanced: Deep Learning, MLOps, Big Data, Production deployment

   For MOBILE DEVELOPMENT:
   - Beginner: Programming basics, Mobile UI/UX, Platform fundamentals
   - Intermediate: Framework (Flutter/React Native), State management, APIs
   - Advanced: Native modules, App publishing, Performance optimization

   For APP DEVELOPMENT:
   - Beginner: Programming fundamentals, UI/UX basics, Framework introduction
   - Intermediate: State management, Backend integration, Database
   - Advanced: Architecture patterns, Testing, CI/CD, Production deployment

   For AI/ML:
   - Beginner: Python, Math foundations, Data manipulation, ML concepts
   - Intermediate: Supervised/Unsupervised learning, Neural networks, NLP basics
   - Advanced: Deep Learning, Transformers, Model deployment, LLM fine-tuning

   For ANY OTHER TOPIC:
   - Research standard learning paths for that domain
   - Break into logical progression from fundamentals to mastery
   - Include industry-standard tools and frameworks

5. PERSONALIZATION:
   - Match learning_objectives: If they want to "build an e-commerce site", include relevant projects
   - If focus_areas specified: Emphasize those topics throughout curriculum
   - Adjust difficulty based on prior_knowledge - don't waste time on known topics

6. JSON FORMATTING:
   - Use double quotes for all strings
   - No trailing commas
   - Escape special characters properly
   - Keep each course object consistent in structure

Generate the curriculum now. Return ONLY the JSON response, nothing else.`;

    return prompt;
}

/**
 * Get default form data structure
 * @returns {Object} Default form data
 */
export function getDefaultFormData() {
    return {
        learning_goal: '',
        current_level: 'Beginner',
        focus_areas: [],
        prior_knowledge: '',
        time_commitment: '10-20 hours/week',
        learning_objectives: '',
        learning_style: 'mixed'
    };
}
