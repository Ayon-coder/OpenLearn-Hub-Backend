"""
AI Assistant Package for OpenLearn-Hub.

This package provides AI-powered learning features:
- Mentor Mode: Interactive tutoring with AI
- Concept Mirror Mode: Analyze and reflect understanding

Usage:
    from ai_assistant import get_ai_client, ai
    
    # Use the lazy client
    response = ai.chat(messages, topic)
    
    # Or create a specific client
    client = get_ai_client(provider="gemini")
"""

from .ai_client import ai, get_ai_client, ACTIVE_PROVIDER, ACTIVE_MODEL
from .base import BaseAIClient
from .config import config

__version__ = "1.0.0"
__all__ = [
    "ai",
    "get_ai_client",
    "BaseAIClient",
    "config",
    "ACTIVE_PROVIDER",
    "ACTIVE_MODEL",
]
