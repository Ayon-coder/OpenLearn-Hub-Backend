"""
Groq AI provider implementation.

This module provides the Groq-specific implementation of the BaseAIClient
interface, using Groq's Python SDK for ultra-fast inference.
"""

import os
import json
import re
from typing import Optional, Dict, Any, List

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from base import BaseAIClient
from prompts import (
    MENTOR_SYSTEM_PROMPT,
    CONCEPT_MIRROR_SYSTEM_PROMPT,
    build_concept_mirror_prompt,
)
from demo import get_mentor_demo_response, get_concept_mirror_demo_response


class GroqClient(BaseAIClient):
    """
    Groq AI client implementation.
    
    Uses Groq's Python SDK for fast inference with various open-source models.
    Requires the 'groq' package to be installed.
    """
    
    # Default model to use if none specified
    DEFAULT_MODEL = "llama-3.3-70b-versatile"
    
    # Available models on Groq
    AVAILABLE_MODELS = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama-3.2-11b-vision-preview",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
        "meta-llama/llama-4-scout-17b-16e-instruct", # User specified
        "compound-mini",  # Compound AI model
        "compound-beta",  # Compound AI model
    ]
    
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        model: Optional[str] = None
    ):
        """
        Initialize the Groq client.
        
        Args:
            api_key: Groq API key. If None, reads from GROQ_API_KEY 
                     environment variable.
            model: Model identifier (e.g., 'llama-3.3-70b-versatile').
                   Defaults to 'llama-3.3-70b-versatile'.
        """
        if not GROQ_AVAILABLE:
            raise ImportError(
                "groq package is not installed. "
                "Install it with: pip install groq"
            )
        
        # Resolve API key from environment if not provided
        resolved_api_key = api_key or os.getenv("GROQ_API_KEY")
        
        if not resolved_api_key:
            raise ValueError(
                "Groq API key is required. Provide it directly or set "
                "GROQ_API_KEY environment variable."
            )
        
        super().__init__(api_key=resolved_api_key, model=model or self.DEFAULT_MODEL)
        
        # Initialize the Groq client
        self._client = Groq(api_key=self.api_key)
    
    def generate_response(self, prompt: str, **kwargs) -> str:
        """
        Generate a response from Groq.
        
        Args:
            prompt: The input prompt to send to the model.
            **kwargs: Additional parameters:
                - temperature (float): Controls randomness (0.0 to 2.0)
                - max_tokens (int): Maximum tokens in response
                - top_p (float): Nucleus sampling parameter
                - stream (bool): Whether to stream the response
        
        Returns:
            The generated text response.
            
        Raises:
            Exception: If the API call fails.
        """
        # Build messages list (Groq uses chat-style API)
        messages: List[Dict[str, str]] = [
            {"role": "user", "content": prompt}
        ]
        
        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1024),
                top_p=kwargs.get("top_p", 1.0),
                stream=False,  # Non-streaming for simple response
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}") from e
    
    def generate_response_with_context(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate a response with context and system prompt.
        
        Args:
            prompt: The user's input prompt.
            context: Additional context to include.
            system_prompt: System-level instructions.
            **kwargs: Additional generation parameters.
            
        Returns:
            The generated text response.
        """
        # Build messages list with system prompt support
        messages: List[Dict[str, str]] = []
        
        # Add system message if provided
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Build user message with context
        user_content = prompt
        if context:
            user_content = f"Context:\n{context}\n\nQuery: {prompt}"
        
        messages.append({
            "role": "user",
            "content": user_content
        })
        
        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1024),
                top_p=kwargs.get("top_p", 1.0),
                stream=False,
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}") from e
    
    def chat(
        self,
        messages: List[Dict[str, str]],
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
        # Use Mentor system prompt by default
        sys_prompt = system_prompt or MENTOR_SYSTEM_PROMPT
        
        # Build conversation for Groq (supports native system messages)
        groq_messages: List[Dict[str, str]] = [
            {"role": "system", "content": sys_prompt}
        ]
        
        # Add conversation history
        for msg in messages:
            role = "user" if msg["role"] == "user" else "assistant"
            groq_messages.append({
                "role": role,
                "content": msg["content"]
            })
        
        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=groq_messages,
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1024),
                top_p=kwargs.get("top_p", 0.9),
                stream=False,
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            # Log the actual error
            print(f"[GROQ ERROR] Chat failed: {e}")
            import traceback
            traceback.print_exc()
            # Fall back to demo response on error
            return get_mentor_demo_response(messages, topic)
    
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
            **kwargs: Additional generation parameters.
            
        Returns:
            Dictionary with keys: understood, missing, incorrect, assumptions, summary.
        """
        # Build messages for concept analysis
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": CONCEPT_MIRROR_SYSTEM_PROMPT},
            {"role": "user", "content": build_concept_mirror_prompt(concept_name, user_explanation)}
        ]
        
        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 4096),
                top_p=kwargs.get("top_p", 0.95),
                stream=False,
            )
            
            # Parse JSON from response
            return self._parse_concept_mirror_response(completion.choices[0].message.content)
            
        except Exception as e:
            # Fall back to demo response on error
            return get_concept_mirror_demo_response(concept_name, user_explanation)
    
    def _parse_concept_mirror_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON from Concept Mirror response."""
        # Try to extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
        
        # Return error structure if parsing fails
        return {
            "understood": ["Unable to parse the analysis response properly"],
            "missing": [],
            "incorrect": [],
            "assumptions": [],
            "summary": "The analysis could not be completed. Please try again."
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current Groq configuration.
        
        Returns:
            Dictionary with provider, model, and availability info.
        """
        return {
            "provider": "groq",
            "provider_name": "Groq",
            "model": self.model,
            "sdk_available": GROQ_AVAILABLE,
            "default_model": self.DEFAULT_MODEL,
            "available_models": self.AVAILABLE_MODELS,
        }
