"""
Gemini AI provider implementation.

This module provides the Gemini-specific implementation of the BaseAIClient
interface, using Google's Generative AI SDK.
"""

import os
import json
import re
from typing import Optional, Dict, Any, List

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from base import BaseAIClient
from prompts import (
    MENTOR_SYSTEM_PROMPT,
    CONCEPT_MIRROR_SYSTEM_PROMPT,
    get_mentor_initial_response,
    get_concept_mirror_acknowledgment,
    build_concept_mirror_prompt,
)
from demo import get_mentor_demo_response, get_concept_mirror_demo_response


class GeminiClient(BaseAIClient):
    """
    Gemini AI client implementation.
    
    Uses Google's Generative AI SDK to interact with Gemini models.
    Requires the 'google-generativeai' package to be installed.
    """
    
    # Default model to use if none specified
    DEFAULT_MODEL = "gemini-1.5-flash"
    
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        model: Optional[str] = None
    ):
        """
        Initialize the Gemini client.
        
        Args:
            api_key: Google API key. If None, reads from GOOGLE_API_KEY 
                     or GEMINI_API_KEY environment variable.
            model: Model identifier (e.g., 'gemini-1.5-flash', 'gemini-1.5-pro').
                   Defaults to 'gemini-1.5-flash'.
        """
        if not GEMINI_AVAILABLE:
            raise ImportError(
                "google-generativeai package is not installed. "
                "Install it with: pip install google-generativeai"
            )
        
        # Resolve API key from environment if not provided
        resolved_api_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        
        if not resolved_api_key:
            raise ValueError(
                "Gemini API key is required. Provide it directly or set "
                "GOOGLE_API_KEY or GEMINI_API_KEY environment variable."
            )
        
        super().__init__(api_key=resolved_api_key, model=model or self.DEFAULT_MODEL)
        
        # Configure the Gemini SDK
        genai.configure(api_key=self.api_key)
        
        # Initialize the generative model
        self._model = genai.GenerativeModel(self.model)
    
    def generate_response(self, prompt: str, **kwargs) -> str:
        """
        Generate a response from Gemini.
        
        Args:
            prompt: The input prompt to send to the model.
            **kwargs: Additional parameters:
                - temperature (float): Controls randomness (0.0 to 1.0)
                - max_output_tokens (int): Maximum tokens in response
                - top_p (float): Nucleus sampling parameter
                - top_k (int): Top-k sampling parameter
        
        Returns:
            The generated text response.
            
        Raises:
            Exception: If the API call fails.
        """
        # Build generation config from kwargs
        generation_config = {}
        
        if "temperature" in kwargs:
            generation_config["temperature"] = kwargs["temperature"]
        if "max_output_tokens" in kwargs:
            generation_config["max_output_tokens"] = kwargs["max_output_tokens"]
        if "top_p" in kwargs:
            generation_config["top_p"] = kwargs["top_p"]
        if "top_k" in kwargs:
            generation_config["top_k"] = kwargs["top_k"]
        
        try:
            response = self._model.generate_content(
                prompt,
                generation_config=generation_config if generation_config else None
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}") from e
    
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
        # Build the full prompt with context
        full_prompt_parts = []
        
        if system_prompt:
            full_prompt_parts.append(f"Instructions: {system_prompt}\n")
        
        if context:
            full_prompt_parts.append(f"Context:\n{context}\n")
        
        full_prompt_parts.append(f"User Query: {prompt}")
        
        full_prompt = "\n".join(full_prompt_parts)
        
        return self.generate_response(full_prompt, **kwargs)
    
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
        
        # Build conversation contents for Gemini
        contents = [
            {
                "role": "user",
                "parts": [{"text": sys_prompt}]
            },
            {
                "role": "model",
                "parts": [{"text": get_mentor_initial_response(topic)}]
            }
        ]
        
        # Add conversation history
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        try:
            response = self._model.generate_content(
                contents,
                generation_config={
                    "temperature": kwargs.get("temperature", 0.8),
                    "top_k": kwargs.get("top_k", 40),
                    "top_p": kwargs.get("top_p", 0.95),
                    "max_output_tokens": kwargs.get("max_output_tokens", 4096),
                }
            )
            return response.text
        except Exception as e:
            # Log the actual error
            print(f"[GEMINI ERROR] Chat failed: {e}")
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
        # Build conversation for concept analysis
        contents = [
            {
                "role": "user",
                "parts": [{"text": CONCEPT_MIRROR_SYSTEM_PROMPT}]
            },
            {
                "role": "model",
                "parts": [{"text": get_concept_mirror_acknowledgment()}]
            },
            {
                "role": "user",
                "parts": [{"text": build_concept_mirror_prompt(concept_name, user_explanation)}]
            }
        ]
        
        try:
            response = self._model.generate_content(
                contents,
                generation_config={
                    "temperature": kwargs.get("temperature", 0.7),
                    "top_k": kwargs.get("top_k", 40),
                    "top_p": kwargs.get("top_p", 0.95),
                    "max_output_tokens": kwargs.get("max_output_tokens", 4096),
                }
            )
            
            # Parse JSON from response
            return self._parse_concept_mirror_response(response.text)
            
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
        Get information about the current Gemini configuration.
        
        Returns:
            Dictionary with provider, model, and availability info.
        """
        return {
            "provider": "gemini",
            "provider_name": "Google Gemini",
            "model": self.model,
            "sdk_available": GEMINI_AVAILABLE,
            "default_model": self.DEFAULT_MODEL,
        }
