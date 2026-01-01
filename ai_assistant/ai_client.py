"""
AI Assistant - Modular AI Provider Architecture

This is the main entry point for the AI assistant backend. It provides
a centralized way to switch between different AI providers (Gemini, Groq, etc.)
by changing a single configuration variable.

Usage:
    from ai_client import get_ai_client
    client = get_ai_client()
    response = client.generate_response("Explain DSA in simple terms")

To switch providers, modify the ACTIVE_PROVIDER variable in .env file.
"""

from typing import Optional
from .base import BaseAIClient
from .config import config

# =============================================================================
# PROVIDER CONFIGURATION - Read from .env via config module
# =============================================================================

# These are loaded from .env file through config.py
ACTIVE_PROVIDER = config.active_provider  # "gemini" or "groq"
ACTIVE_MODEL = config.active_model  # Model override or None for default
API_KEY = None  # API keys are read from environment by each provider

# =============================================================================
# PROVIDER REGISTRY - Maps provider names to their client classes
# =============================================================================

def _get_provider_class(provider_name: str):
    """
    Lazily import and return the provider class.
    
    This avoids import errors if a provider's dependencies aren't installed.
    """
    if provider_name == "gemini":
        from .gemini_provider import GeminiClient
        return GeminiClient
    elif provider_name == "groq":
        from .groq_provider import GroqClient
        return GroqClient
    else:
        raise ValueError(
            f"Unknown provider: {provider_name}. "
            f"Available providers: gemini, groq"
        )


def get_ai_client(
    provider: Optional[str] = None,
    model: Optional[str] = None,
    api_key: Optional[str] = None
) -> BaseAIClient:
    """
    Get an AI client instance.
    
    This function creates and returns an AI client based on the configuration.
    By default, it uses the global ACTIVE_PROVIDER, ACTIVE_MODEL, and API_KEY
    settings, but these can be overridden with function arguments.
    
    Args:
        provider: Override the active provider. Options: "gemini", "groq"
        model: Override the model to use.
        api_key: Override the API key.
        
    Returns:
        An instance of the appropriate AI client implementing BaseAIClient.
        
    Example:
        # Use default configuration
        client = get_ai_client()
        
        # Override provider for this call
        groq_client = get_ai_client(provider="groq")
        
        # Use specific model
        client = get_ai_client(model="gemini-1.5-pro")
    """
    # Use provided values or fall back to global configuration
    selected_provider = provider or ACTIVE_PROVIDER
    selected_model = model or ACTIVE_MODEL
    selected_api_key = api_key or API_KEY
    
    # Get the provider class and instantiate it
    provider_class = _get_provider_class(selected_provider)
    return provider_class(api_key=selected_api_key, model=selected_model)


# =============================================================================
# GLOBAL AI CLIENT INSTANCE - For convenient access
# =============================================================================

# Create a module-level client instance for easy access
# This is initialized lazily on first access to avoid errors at import time

class _LazyAIClient:
    """
    Lazy wrapper for the AI client.
    
    This allows importing the module without immediately creating a client,
    which could fail if API keys aren't configured. The client is created
    on first method call.
    """
    
    _instance: Optional[BaseAIClient] = None
    
    def _get_client(self) -> BaseAIClient:
        """Get or create the client instance."""
        if self._instance is None:
            self._instance = get_ai_client()
        return self._instance
    
    def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate a response using the configured provider."""
        return self._get_client().generate_response(prompt, **kwargs)
    
    def generate_response_with_context(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        """Generate a response with context and system prompt."""
        return self._get_client().generate_response_with_context(
            prompt, context, system_prompt, **kwargs
        )
    
    def chat(
        self,
        messages: list,
        topic: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Conduct a multi-turn chat conversation (Mentor Mode).
        
        Args:
            messages: List of message dicts with 'role' and 'content' keys.
            topic: The topic being discussed.
            system_prompt: Optional system prompt override.
            **kwargs: Additional generation parameters.
            
        Returns:
            The assistant's response text.
        """
        return self._get_client().chat(messages, topic, system_prompt, **kwargs)
    
    def analyze_concept(
        self,
        concept_name: str,
        user_explanation: str,
        **kwargs
    ) -> dict:
        """
        Analyze a user's concept explanation (Concept Mirror Mode).
        
        Args:
            concept_name: Name of the concept being explained.
            user_explanation: The user's explanation text.
            **kwargs: Additional generation parameters.
            
        Returns:
            Dictionary with keys: understood, missing, incorrect, assumptions, summary.
        """
        return self._get_client().analyze_concept(concept_name, user_explanation, **kwargs)
    
    def get_model_info(self) -> dict:
        """Get information about the current model configuration."""
        return self._get_client().get_model_info()
    
    def reset(self):
        """Reset the client instance. Useful after changing configuration."""
        self._instance = None
    
    def __repr__(self) -> str:
        if self._instance:
            return repr(self._instance)
        return f"LazyAIClient(provider={ACTIVE_PROVIDER}, initialized=False)"


# Global AI client instance for convenient access
ai = _LazyAIClient()

# =============================================================================
# PUBLIC API
# =============================================================================

__all__ = [
    # Main entry points
    "ai",               # Lazy global client instance
    "get_ai_client",    # Factory function for creating clients
    
    # Configuration
    "ACTIVE_PROVIDER",  # Current provider setting
    "ACTIVE_MODEL",     # Current model override
    
    # Base class (for type hints and extending)
    "BaseAIClient",
]
