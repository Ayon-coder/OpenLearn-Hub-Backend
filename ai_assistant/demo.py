"""
Demo/Fallback responses for AI Assistant.

Provides mock responses when API keys are not configured or when
demo mode is enabled. Ported from React frontend geminiService.js.
"""

import re
from typing import List, Dict, Any


# =============================================================================
# MENTOR MODE DEMO RESPONSES
# =============================================================================

def get_mentor_demo_response(messages: List[Dict[str, str]], topic: str) -> str:
    """
    Generate a demo response for Mentor Mode.
    
    Args:
        messages: List of conversation messages with 'role' and 'content' keys.
        topic: The topic being discussed.
        
    Returns:
        A mock mentor response string.
    """
    last_message = messages[-1]["content"].lower() if messages else ""
    
    # First message in conversation - welcome response
    if len(messages) == 1:
        return f"""Great choice! Let's explore **{topic}** together. 🎯

I'll guide you through this topic step by step. Here's what we can cover:

**📚 Fundamentals** - Core concepts and definitions
- **💡 Examples** - Real-world applications and code samples  
- **🧩 Practice** - Exercises to test your understanding
- **❓ Q&A** - Any questions you have along the way

Where would you like to start? Feel free to ask me anything about {topic}, or tell me what aspect you're most interested in!"""

    # User asked for examples or code
    if "example" in last_message or "code" in last_message:
        return f"""Here's a practical example to illustrate the concept:

```python
# Example: {topic}
def example_function():
    \"\"\"
    This demonstrates the core concept.
    \"\"\"
    # Step 1: Initialize
    data = prepare_data()
    
    # Step 2: Process
    result = process_data(data)
    
    # Step 3: Return
    return result
```

**Key takeaways:**
- Notice how we break it into clear steps
- Each part has a specific purpose
- Error handling would be important in production

Would you like me to explain any part in more detail, or shall we try a practice exercise?"""

    # Default response
    return f"""That's a great question about {topic}!

**Here's what you need to know:**

- **Core Concept** - The fundamental idea behind this is...
- **How it works** - In practice, this applies when...
- **Common use cases** - You'll often see this in...

**💡 Pro tip:** The best way to solidify this understanding is through practice.

What aspect would you like to explore further? I can:
- Provide more examples
- Explain the underlying theory
- Give you a practice challenge

Just let me know!"""


# =============================================================================
# CONCEPT MIRROR MODE DEMO RESPONSES
# =============================================================================

def get_concept_mirror_demo_response(concept_name: str, explanation: str) -> Dict[str, Any]:
    """
    Generate a demo analysis response for Concept Mirror Mode.
    
    Args:
        concept_name: The name of the concept being explained.
        explanation: The user's explanation of the concept.
        
    Returns:
        A dictionary matching the Concept Mirror JSON structure.
    """
    lower_explanation = explanation.lower()
    word_count = len(explanation.split())
    
    # Pattern detection
    patterns = {
        "has_examples": bool(re.search(
            r"for example|e\.g\.|such as|like when|consider|imagine", 
            explanation, 
            re.IGNORECASE
        )),
        "has_edge_cases": bool(re.search(
            r"edge case|corner case|exception|special case|however|but|unless", 
            explanation, 
            re.IGNORECASE
        )),
        "is_vague": bool(re.search(
            r"kind of|sort of|basically|probably|maybe|I think|something like", 
            explanation, 
            re.IGNORECASE
        )),
        "is_confident": bool(re.search(
            r"always|never|must|definitely|certainly|obviously", 
            explanation, 
            re.IGNORECASE
        )),
        "has_technical_terms": bool(re.search(
            r"O\(|complexity|algorithm|data structure|time|space|memory", 
            explanation, 
            re.IGNORECASE
        )),
        "has_why": bool(re.search(
            r"because|reason|purpose|in order to|so that", 
            explanation, 
            re.IGNORECASE
        )),
        "has_how": bool(re.search(
            r"steps?|first|then|next|process|procedure", 
            explanation, 
            re.IGNORECASE
        )),
    }
    
    understood = []
    missing = []
    incorrect = []
    assumptions = []
    
    # Build response based on patterns
    if word_count > 80:
        understood.append(
            "The explanation demonstrates substantial engagement with the topic, "
            "suggesting active thinking about the concept"
        )
    elif word_count > 40:
        understood.append("The explanation shows reasonable familiarity with the concept")
    
    if patterns["has_examples"]:
        understood.append(
            "Concrete examples were provided, indicating practical understanding "
            "beyond abstract definition"
        )
    
    if patterns["has_how"]:
        understood.append(
            "A procedural understanding is evident — you describe steps or processes involved"
        )
    
    if patterns["has_why"]:
        understood.append(
            "The explanation addresses the \"why\" behind the concept, showing deeper reasoning"
        )
    
    if not patterns["has_examples"]:
        missing.append(
            "No concrete examples were provided — the explanation remains purely abstract"
        )
    
    if not patterns["has_edge_cases"]:
        missing.append(
            "Edge cases, limitations, or boundary conditions were not addressed"
        )
    
    if not patterns["has_why"] and patterns["has_how"]:
        missing.append(
            "The explanation describes \"how\" but not \"why\" — "
            "the underlying motivation is unclear"
        )
    
    if patterns["is_confident"] and word_count < 40:
        incorrect.append(
            "Confident assertions appear without sufficient context — "
            "this may indicate overconfidence in an incomplete model"
        )
    
    if patterns["is_vague"]:
        assumptions.append(
            "Hedging language (\"sort of\", \"basically\") suggests uncertainty "
            "about specific details"
        )
    
    assumptions.append(
        f"Assumption that the fundamental definition of \"{concept_name}\" "
        "is shared between explainer and audience"
    )
    
    # Generate summary
    if word_count < 30:
        model_type = "surface-level"
        summary_details = (
            "The brevity suggests either overconfidence in a simple mental model, "
            "or uncertainty about how to elaborate."
        )
    elif patterns["has_how"] and patterns["has_why"] and patterns["has_examples"]:
        model_type = "comprehensive but possibly incomplete"
        summary_details = (
            "The explanation covers multiple dimensions (what, how, why) with examples, "
            "though depth may vary."
        )
    elif patterns["has_how"] and not patterns["has_why"]:
        model_type = "procedural but shallow"
        summary_details = (
            "You can describe the mechanics but may lack understanding of underlying principles."
        )
    else:
        model_type = "partially developed"
        summary_details = (
            "Some aspects are articulated clearly while others remain implicit or unexplored."
        )
    
    summary = (
        f"Your understanding of \"{concept_name}\" appears to be {model_type}. "
        f"{summary_details}"
    )
    
    return {
        "understood": understood if understood else ["Basic familiarity with the concept is evident"],
        "missing": missing[:4],  # Limit to 4 items
        "incorrect": incorrect,
        "assumptions": assumptions[:3],  # Limit to 3 items
        "summary": summary
    }
