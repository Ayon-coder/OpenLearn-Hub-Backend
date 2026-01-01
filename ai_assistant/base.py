"""
Base module defining the abstract interface for all AI providers.

This module contains the abstract base class that all AI provider implementations
must inherit from, ensuring a consistent interface across different LLM providers.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class BaseAIClient(ABC):
    """
    Abstract base class for AI provider clients.
    
    All AI providers (Gemini, Groq, OpenAI, Claude, etc.) must implement
    this interface to ensure consistent behavior across the application.
    """
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize the AI client.
        
        Args:
            api_key: The API key for authentication. If None, should be
                     loaded from environment variables.
            model: The model identifier to use. If None, uses provider default.
        """
        self.api_key = api_key
        self.model = model
    
    @abstractmethod
    def generate_response(self, prompt: str, **kwargs) -> str:
        """
        Generate a response from the AI model.
        
        Args:
            prompt: The input prompt/question to send to the model.
            **kwargs: Additional provider-specific parameters.
            
        Returns:
            The generated text response from the model.
            
        Raises:
            Exception: If the API call fails or returns an error.
        """
        pass
    
    @abstractmethod
    def generate_response_with_context(
        self, 
        prompt: str, 
        context: Optional[str] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate a response with additional context and system prompt.
        
        Args:
            prompt: The user's input prompt/question.
            context: Additional context to include (e.g., document content).
            system_prompt: System-level instructions for the model.
            **kwargs: Additional provider-specific parameters.
            
        Returns:
            The generated text response from the model.
        """
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration.
        
        Returns:
            Dictionary containing model name, provider, and other metadata.
        """
        pass
    
    @abstractmethod
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
            **kwargs: Additional provider-specific parameters.
            
        Returns:
            The assistant's response text.
        """
        pass
    
    @abstractmethod
    def analyze_concept(
        self,
        concept_name: str,
        user_explanation: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Analyze a user's concept explanation (Concept Mirror Mode).
        
        Args:
            concept_name: Name of the concept being explained.
            user_explanation: The user's explanation text.
            **kwargs: Additional provider-specific parameters.
            
        Returns:
            Dictionary with keys: understood, missing, incorrect, assumptions, summary.
        """
        pass
    
    def __repr__(self) -> str:
        """String representation of the client."""
        return f"{self.__class__.__name__}(model={self.model})"
