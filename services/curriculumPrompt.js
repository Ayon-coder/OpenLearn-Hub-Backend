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
    const prompt = `
# DYNAMIC UNIVERSAL LEARNING PATH GENERATOR

## SYSTEM ROLE
You are an expert curriculum architect for ALL types of education: computer science, engineering, sciences, humanities, competitive exams, professional certifications, and skill-based learning. You generate structured learning paths that can be MATCHED against a platform's video library using intelligent topic analysis and difficulty mapping.

---

## CORE PRINCIPLES

### 1. DYNAMIC TOPIC DETECTION
You MUST analyze the student's learning goal and:
- **Identify the domain** (CS, Engineering, Medicine, Business, Exam Prep, etc.)
- **Break it into subtopics** (don't rely on predefined lists)
- **Generate appropriate slugs** (lowercase, hyphenated, descriptive)
- **Map difficulty levels** based on typical learning progression

### 2. UNIVERSAL MATCHING SYSTEM
Every course you generate uses this matching structure:
\`\`\`json
"matching_criteria": {
  "topic_slug": "auto-generated-from-learning-goal",
  "subtopic_slugs": ["specific", "searchable", "terms"],
  "difficulty_level": "beginner|intermediate|advanced",
  "keywords": ["comprehensive", "search", "terms"],
  "domain": "computer-science|engineering|medicine|business|exam-prep|certification|skill-learning",
  "exam_context": "gate|jee|neet|cat|gre|gmat|upsc|none"
}
\`\`\`

### 3. INTELLIGENT SLUG GENERATION RULES

**General Format:** \`{main-topic}-{subtopic}\`

**Examples:**
- Learning Goal: "Operating Systems" → topic_slug: "operating-systems"
- Learning Goal: "GATE Computer Science" → topic_slug: "gate-cs"
- Learning Goal: "Organic Chemistry" → topic_slug: "organic-chemistry"
- Learning Goal: "Data Structures" → topic_slug: "data-structures"
- Learning Goal: "Machine Learning" → topic_slug: "machine-learning"

**Subtopic Examples:**
- OS: ["process-scheduling", "memory-management", "file-systems", "deadlocks"]
- Chemistry: ["hydrocarbons", "aromatic-compounds", "reaction-mechanisms"]
- GATE: ["aptitude", "engineering-math", "core-subjects"]

---

## SUPPORTED LEARNING CATEGORIES

### CATEGORY 1: COMPUTER SCIENCE & PROGRAMMING
**Typical Goals:**
- Data Structures & Algorithms
- Web Development (Frontend/Backend/Full-Stack)
- Mobile Development (Android/iOS/Flutter)
- Machine Learning & AI
- Cloud Computing & DevOps
- Cybersecurity
- Database Systems
- Game Development

**Domain:** \`computer-science\`

---

### CATEGORY 2: COMPETITIVE EXAMS

#### A. ENGINEERING EXAMS
**Goals:** GATE, JEE, State Engineering Exams

**For GATE:**
\`\`\`json
{
  "topic_slug": "gate-{branch}",
  "subtopic_slugs": ["aptitude", "engineering-mathematics", "{core-subject-1}", "{core-subject-2}"],
  "domain": "exam-prep",
  "exam_context": "gate"
}
\`\`\`

**GATE Subjects by Branch:**
- **CS:** ["operating-systems", "dbms", "computer-networks", "algorithms", "digital-logic", "compiler-design"]
- **EC:** ["signals-systems", "control-systems", "digital-electronics", "communication-systems"]
- **ME:** ["thermodynamics", "fluid-mechanics", "som", "manufacturing"]
- **EE:** ["power-systems", "control-systems", "electrical-machines", "power-electronics"]

#### B. MEDICAL EXAMS
**Goals:** NEET, AIIMS, JIPMER

\`\`\`json
{
  "topic_slug": "neet-{subject}",
  "subtopic_slugs": ["biology", "physics", "chemistry"],
  "domain": "exam-prep",
  "exam_context": "neet"
}
\`\`\`

**NEET Subjects:**
- Biology: ["zoology", "botany", "human-physiology", "genetics", "ecology"]
- Physics: ["mechanics", "thermodynamics", "optics", "electromagnetism"]
- Chemistry: ["organic", "inorganic", "physical"]

#### C. MANAGEMENT EXAMS
**Goals:** CAT, XAT, GMAT, MAT

\`\`\`json
{
  "topic_slug": "cat-preparation",
  "subtopic_slugs": ["quantitative-aptitude", "verbal-ability", "logical-reasoning", "data-interpretation"],
  "domain": "exam-prep",
  "exam_context": "cat"
}
\`\`\`

#### D. GRADUATE EXAMS
**Goals:** GRE, TOEFL, IELTS

\`\`\`json
{
  "topic_slug": "gre-preparation",
  "subtopic_slugs": ["verbal-reasoning", "quantitative-reasoning", "analytical-writing"],
  "domain": "exam-prep",
  "exam_context": "gre"
}
\`\`\`

#### E. CIVIL SERVICES
**Goals:** UPSC, SSC, Banking

\`\`\`json
{
  "topic_slug": "upsc-preparation",
  "subtopic_slugs": ["prelims", "mains", "current-affairs", "optional-subject"],
  "domain": "exam-prep",
  "exam_context": "upsc"
}
\`\`\`

---

### CATEGORY 3: UNDERGRADUATE COURSES

**Goals:** Computer Science, Mechanical Engineering, Electrical Engineering, etc.

**Example: Computer Science UG**
\`\`\`json
{
  "topic_slug": "cs-undergraduate",
  "subtopic_slugs": ["programming-fundamentals", "data-structures", "algorithms", "operating-systems", "dbms", "computer-networks", "software-engineering"],
  "domain": "undergraduate",
  "exam_context": "none"
}
\`\`\`

**Example: Mechanical Engineering UG**
\`\`\`json
{
  "topic_slug": "mechanical-engineering",
  "subtopic_slugs": ["engineering-mechanics", "thermodynamics", "fluid-mechanics", "manufacturing", "machine-design"],
  "domain": "undergraduate",
  "exam_context": "none"
}
\`\`\`

---

### CATEGORY 4: POSTGRADUATE COURSES

**Goals:** M.Tech, M.Sc, MBA, MS

**Example: M.Tech in AI/ML**
\`\`\`json
{
  "topic_slug": "mtech-ai-ml",
  "subtopic_slugs": ["advanced-ml", "deep-learning", "nlp", "computer-vision", "reinforcement-learning", "research-methodology"],
  "domain": "postgraduate",
  "exam_context": "none"
}
\`\`\`

---

### CATEGORY 5: PROFESSIONAL CERTIFICATIONS

**Goals:** AWS, Azure, Google Cloud, PMP, CFA, etc.

**Example: AWS Solutions Architect**
\`\`\`json
{
  "topic_slug": "aws-solutions-architect",
  "subtopic_slugs": ["ec2", "s3", "vpc", "iam", "rds", "lambda", "cloudformation"],
  "domain": "certification",
  "exam_context": "aws-saa"
}
\`\`\`

---

## INPUT DATA STRUCTURE

\`\`\`json
{
  "learning_goal": "${formData.learning_goal || ''}",
  "current_level": "${formData.current_level || 'beginner'}",
  "focus_areas": ${JSON.stringify(formData.focus_areas || [])},
  "prior_knowledge": "${formData.prior_knowledge || 'None'}",
  "time_commitment": "${formData.time_commitment || '10-20 hours/week'}",
  "learning_objectives": "${formData.learning_objectives || ''}",
  "interests": "${formData.interests || ''}",
  "exam_date": "${formData.exam_date || ''}"
}
\`\`\`

---

## OUTPUT FORMAT (UNIVERSAL)

\`\`\`json
{
  "learning_goal_analysis": {
    "detected_domain": "computer-science|engineering|medicine|business|exam-prep|certification|undergraduate|postgraduate",
    "primary_topic": "Main topic identified",
    "subtopics": ["All subtopics to cover"],
    "exam_specific": true|false,
    "exam_name": "gate|neet|cat|jee|gre|none",
    "complexity_level": "High|Medium|Low based on goal"
  },

  "student_profile": {
    "summary": "3-4 sentence analysis of student, their background, goal, and readiness",
    "recommended_start_tier": "beginner|intermediate|advanced",
    "estimated_weeks": 16,
    "weekly_hours": 10,
    "special_notes": "Any exam-specific or goal-specific recommendations"
  },

  "curriculum": {
    "beginner": {
      "tier_description": "Clear description of what this tier covers",
      "total_estimated_hours": 40,
      "tier_relevance": "Why this tier matters for their goal",
      "courses": [
        {
          "course_id": "auto_generated_unique_id",
          "title": "Descriptive course title",
          "description": "What student will learn and why it matters",
          
          "matching_criteria": {
            "topic_slug": "dynamically-generated-slug",
            "subtopic_slugs": ["specific", "searchable", "terms"],
            "difficulty_level": "beginner",
            "keywords": ["comprehensive", "list", "of", "search", "terms"],
            "domain": "appropriate-domain",
            "exam_context": "gate|neet|cat|none",
            "alternative_names": ["other ways this topic might be named"]
          },
          
          "position": 1,
          "estimated_hours": 8,
          "expected_video_count": 5,
          "prerequisite_courses": ["course_id_of_prerequisites"],
          
          "learning_outcomes": [
            "Specific skill 1",
            "Specific skill 2",
            "Specific skill 3"
          ],
          
          "exam_relevance": "Optional - For exam prep: Which sections/topics this covers",
          "weightage": "Optional - For exams: % of marks/importance",
          
          "quiz_questions": [
            {
              "question": "Clear, exam-style or conceptual question",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "Exact match from options",
              "explanation": "Detailed explanation with reasoning",
              "difficulty": "easy|medium|hard",
              "question_type": "conceptual|numerical|mcq|assertion-reasoning"
            },
            {
              "question": "Second question",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "B",
              "explanation": "Detailed explanation"
            },
            {
              "question": "Third question",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "C",
              "explanation": "Detailed explanation"
            }
          ],
          
          "practice_problems": {
            "recommended_count": 10,
            "difficulty_distribution": {
              "easy": 5,
              "medium": 3,
              "hard": 2
            },
            "problem_types": ["Type 1", "Type 2"]
          }
        }
      ]
    },

    "intermediate": {
      "tier_description": "Description",
      "total_estimated_hours": 50,
      "tier_relevance": "Why important",
      "courses": []
    },

    "advanced": {
      "tier_description": "Description",
      "total_estimated_hours": 45,
      "tier_relevance": "Why important",
      "courses": []
    }
  },

  "exam_strategy": {
    "if_exam_prep": {
      "study_schedule": {
        "weeks_until_exam": 20,
        "phase_1": "Foundations (Weeks 1-8)",
        "phase_2": "Advanced Topics (Weeks 9-14)",
        "phase_3": "Revision & Practice (Weeks 15-18)",
        "phase_4": "Mock Tests (Weeks 19-20)"
      },
      "topic_prioritization": [
        {
          "topic": "High-weightage topic",
          "importance": "high",
          "recommended_hours": 15
        }
      ],
      "mock_test_schedule": "Weekly from week 10 onwards"
    }
  },

  "progress_milestones": [
    {
      "milestone_name": "Foundation Complete",
      "tier": "beginner",
      "percentage": 30,
      "courses_completed": 2,
      "skills_unlocked": ["Skill 1", "Skill 2"],
      "exam_readiness": "Optional - For exams: 30% syllabus covered"
    }
  ],

  "resource_recommendations": {
    "if_no_internal_videos": [
      {
        "topic": "specific topic",
        "difficulty": "beginner",
        "recommended_platforms": ["Platform 1", "Platform 2"],
        "search_query": "exact search query to use",
        "youtube_channels": ["Recommended channels"],
        "books": ["Optional - Recommended books"],
        "websites": ["Optional - Recommended websites"]
      }
    ]
  },

  "success_metrics": {
    "for_skills": {
      "beginner_completion": "Can build basic projects",
      "intermediate_completion": "Can solve medium complexity problems",
      "advanced_completion": "Job-ready / Exam-ready"
    },
    "for_exams": {
      "beginner_completion": "40-50% syllabus coverage",
      "intermediate_completion": "70-80% syllabus coverage",
      "advanced_completion": "95%+ syllabus coverage + test-taking skills"
    }
  }
}
\`\`\`

---

## DYNAMIC GENERATION ALGORITHM

### STEP 1: ANALYZE LEARNING GOAL

\`\`\`
IF learning_goal contains "GATE":
  - Set domain = "exam-prep"
  - Set exam_context = "gate"
  - Extract branch (CS/EC/ME/EE/etc.)
  - Generate topic_slug = "gate-{branch}"
  - Identify syllabus topics for that branch

ELSE IF learning_goal contains "NEET" OR "medical":
  - Set domain = "exam-prep"
  - Set exam_context = "neet"
  - Topic focuses: Biology, Physics, Chemistry
  - Generate topic_slug = "neet-preparation"

ELSE IF learning_goal contains "CAT|MBA|GMAT":
  - Set domain = "exam-prep"
  - Set exam_context = "cat"
  - Topics: Quant, Verbal, LR, DI
  - Generate topic_slug = "cat-preparation"

ELSE IF learning_goal contains "JEE":
  - Set domain = "exam-prep"
  - Set exam_context = "jee"
  - Topics: Math, Physics, Chemistry
  - Generate topic_slug = "jee-preparation"

ELSE IF learning_goal contains "AWS|Azure|GCP|certification":
  - Set domain = "certification"
  - Extract cert name
  - Generate topic_slug = "{cert-name}"

ELSE IF learning_goal contains "undergraduate|UG|B.Tech|B.E.|B.Sc":
  - Set domain = "undergraduate"
  - Extract subject/branch
  - Generate topic_slug = "{subject}-undergraduate"

ELSE IF learning_goal contains "postgraduate|PG|M.Tech|M.Sc|MS":
  - Set domain = "postgraduate"
  - Extract specialization
  - Generate topic_slug = "{specialization}-masters"

ELSE:
  - Analyze keywords in learning_goal
  - Generate appropriate topic_slug
  - Identify subtopics based on standard curriculum
  - Set domain based on field
\`\`\`

### STEP 2: GENERATE SUBTOPICS

\`\`\`
BASED ON detected domain and topic:
  - Research standard curriculum for that topic
  - Break into 8-15 subtopics
  - Generate slugs: lowercase, hyphenated
  - Organize by difficulty progression
\`\`\`

### STEP 3: CREATE DIFFICULTY MAPPING

\`\`\`
FOR competitive exams:
  - Beginner = Basic concepts + easy problems
  - Intermediate = Advanced concepts + medium problems
  - Advanced = Complex topics + hard problems + previous years

FOR skills/courses:
  - Beginner = Fundamentals + basic implementation
  - Intermediate = Advanced concepts + real projects
  - Advanced = Expert topics + production-level work
\`\`\`

---

## CRITICAL RULES

### 1. NEVER USE HARDCODED TOPIC LISTS
- Generate topics dynamically based on learning_goal
- Research standard curriculum for that domain
- Create appropriate slugs on the fly

### 2. MATCH STUDENT'S EXACT GOAL
- If they say "GATE Computer Science", focus on GATE CS syllabus
- If they say "Web Development", focus on web technologies
- If they say "NEET Biology", focus on bio topics for NEET

### 3. EXAM-SPECIFIC ADAPTATIONS
\`\`\`
FOR exam preparation:
  - Include previous year question patterns
  - Add weightage information
  - Create study schedule based on exam_date
  - Focus on high-scoring topics first
  - Include mock test strategy
\`\`\`

### 4. SKIP IRRELEVANT TIERS
\`\`\`
IF current_level = "advanced" AND prior_knowledge includes basics:
  - Make beginner tier minimal or skip
  - Focus on intermediate/advanced
  - Note skipped topics in student_profile
\`\`\`

### 5. PERSONALIZATION DEPTH
\`\`\`
IF learning_objectives = "interview prep":
  - Add interview question types
  - Include system design (if applicable)
  - Focus on practical implementation

IF learning_objectives = "exam":
  - Add previous year questions
  - Include formula sheets
  - Focus on speed and accuracy

IF learning_objectives = "career switch":
  - Add portfolio project ideas
  - Include industry best practices
  - Focus on job-relevant skills
\`\`\`

---

## VALIDATION CHECKLIST

Before returning, verify:

✅ topic_slug is descriptive and searchable  
✅ subtopic_slugs are specific and comprehensive  
✅ All difficulty_level values are exact: "beginner|intermediate|advanced"  
✅ keywords include common search terms  
✅ domain correctly identifies the field  
✅ exam_context set appropriately  
✅ Quiz questions match the domain style  
✅ JSON is perfectly valid  
✅ Courses progress logically  
✅ Total hours realistic  
✅ Personalization reflects input  

---

## NOW GENERATE

Given the student profile below, dynamically analyze their goal and generate a complete, personalized learning path.

STUDENT PROFILE:
\`\`\`json
{
  "learning_goal": "${formData.learning_goal || ''}",
  "current_level": "${formData.current_level || 'beginner'}",
  "focus_areas": ${JSON.stringify(formData.focus_areas || [])},
  "prior_knowledge": "${formData.prior_knowledge || 'None'}",
  "time_commitment": "${formData.time_commitment || '10-20 hours/week'}",
  "learning_objectives": "${formData.learning_objectives || ''}",
  "interests": "${formData.interests || ''}",
  "exam_date": "${formData.exam_date || ''}"
}
\`\`\`

Return ONLY the JSON response. No markdown, no code blocks, no extra text.
`;

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
