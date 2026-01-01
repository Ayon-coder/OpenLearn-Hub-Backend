"""
Configuration module for AI Assistant.

Loads environment variables from the parent backend's .env file and provides 
centralized configuration management for the AI assistant module.
"""

import os
from pathlib import Path
from typing import Optional, Literal

# Try to load python-dotenv if available
try:
    from dotenv import load_dotenv
    
    # Load .env file from the parent backend directory (shared env)
    backend_env = Path(__file__).parent.parent / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
    else:
        # Also check current directory for local development
        local_env = Path(__file__).parent / ".env"
        if local_env.exists():
            load_dotenv(local_env)
except ImportError:
    pass  # python-dotenv not installed, rely on system env vars


class Config:
    """
    Centralized configuration class for AI Assistant.
    
    All settings are loaded from environment variables with sensible defaults.
    """
    
    # ==========================================================================
    # Provider Configuration
    # ==========================================================================
    
    @property
    def active_provider(self) -> Literal["gemini", "groq"]:
        """Get the active AI provider."""
        provider = os.getenv("ACTIVE_PROVIDER", "gemini").lower()
        if provider not in ("gemini", "groq"):
            return "gemini"
        return provider
    
    @property
    def active_model(self) -> Optional[str]:
        """Get the model override, if any."""
        model = os.getenv("ACTIVE_MODEL", "").strip()
        return model if model else None
    
    # ==========================================================================
    # API Keys
    # ==========================================================================
    
    @property
    def google_api_key(self) -> Optional[str]:
        """Get Gemini/Google API key."""
        return os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    
    @property
    def groq_api_key(self) -> Optional[str]:
        """Get Groq API key."""
        return os.getenv("GROQ_API_KEY")
    
    def get_api_key(self, provider: Optional[str] = None) -> Optional[str]:
        """Get API key for the specified or active provider."""
        provider = provider or self.active_provider
        if provider == "gemini":
            return self.google_api_key
        elif provider == "groq":
            return self.groq_api_key
        return None
    
    def has_api_key(self, provider: Optional[str] = None) -> bool:
        """Check if API key is configured for the specified or active provider."""
        key = self.get_api_key(provider)
        return bool(key and key != "your_gemini_api_key_here" and key != "your_groq_api_key_here")
    
    # ==========================================================================
    # Server Configuration
    # ==========================================================================
    
    @property
    def flask_host(self) -> str:
        """Get Flask server host."""
        return os.getenv("FLASK_HOST", "127.0.0.1")
    
    @property
    def flask_port(self) -> int:
        """Get Flask server port (default 5050 to avoid conflict with Node.js)."""
        try:
            return int(os.getenv("FLASK_PORT", "5050"))
        except ValueError:
            return 5050
    
    @property
    def flask_debug(self) -> bool:
        """Get Flask debug mode setting."""
        return os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    
    @property
    def demo_mode(self) -> bool:
        """Check if demo mode is enabled."""
        return os.getenv("DEMO_MODE", "False").lower() in ("true", "1", "yes")
    
    # ==========================================================================
    # Utility Methods
    # ==========================================================================
    
    def to_dict(self) -> dict:
        """Export configuration as dictionary (without sensitive keys)."""
        return {
            "active_provider": self.active_provider,
            "active_model": self.active_model,
            "has_google_api_key": self.has_api_key("gemini"),
            "has_groq_api_key": self.has_api_key("groq"),
            "flask_host": self.flask_host,
            "flask_port": self.flask_port,
            "flask_debug": self.flask_debug,
            "demo_mode": self.demo_mode,
        }
    
    def __repr__(self) -> str:
        return f"Config(provider={self.active_provider}, model={self.active_model})"


# Global configuration instance
config = Config()
