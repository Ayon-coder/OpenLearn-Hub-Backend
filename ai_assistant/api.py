"""
Flask REST API for AI Assistant.

Provides HTTP endpoints for Mentor Mode and Concept Mirror Mode,
enabling the React frontend to communicate with the Python backend.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Optional
import traceback
import sys

from .config import config
from .demo import get_mentor_demo_response, get_concept_mirror_demo_response

# Import the AI client factory
def _get_ai_client():
    """Lazy import to avoid circular dependencies."""
    try:
        from .ai_client import get_ai_client
        return get_ai_client()
    except Exception as e:
        print(f"[ERROR] Failed to get AI client: {e}")
        traceback.print_exc()
        raise


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Enable CORS for all routes (allows React frontend to connect)
    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"])
    
    # ==========================================================================
    # Health Check Endpoint
    # ==========================================================================
    
    @app.route("/", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            "status": "healthy",
            "service": "ai-assistant",
            "provider": config.active_provider,
            "model": config.active_model,
            "has_api_key": config.has_api_key(),
            "demo_mode": config.demo_mode,
        })
    
    # ==========================================================================
    # Configuration Endpoint
    # ==========================================================================
    
    @app.route("/config", methods=["GET"])
    def get_config():
        """Get current configuration (without sensitive data)."""
        return jsonify(config.to_dict())
    
    # ==========================================================================
    # Mentor Mode Endpoint
    # ==========================================================================
    
    @app.route("/mentor", methods=["POST"])
    def mentor_chat():
        """
        Mentor Mode chat endpoint.
        
        Request body:
            {
                "messages": [{"role": "user", "content": "..."}],
                "topic": "Python"
            }
            
        Response:
            {
                "response": "AI mentor response...",
                "provider": "gemini"
            }
        """
        try:
            print(f"[MENTOR] Received POST request")
            sys.stdout.flush()  # Force flush output
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            messages = data.get("messages", [])
            topic = data.get("topic", "General")
            
            if not messages:
                return jsonify({"error": "Messages array is required"}), 400
            
            # Check if demo mode or no API key
            if config.demo_mode or not config.has_api_key():
                response = get_mentor_demo_response(messages, topic)
                return jsonify({
                    "response": response,
                    "provider": "demo",
                    "demo_mode": True
                })
            
            # Get AI client and generate response
            print(f"[MENTOR] Getting AI client...")
            client = _get_ai_client()
            print(f"[MENTOR] Client: {client}")
            
            response = client.chat(messages, topic)
            print(f"[MENTOR] Response received")
            
            return jsonify({
                "response": response,
                "provider": config.active_provider,
                "model": client.model,
            })
            
        except Exception as e:
            # Fall back to demo mode on error
            response = get_mentor_demo_response(
                data.get("messages", []) if data else [],
                data.get("topic", "General") if data else "General"
            )
            return jsonify({
                "response": response,
                "provider": "demo",
                "error": str(e),
                "fallback": True
            })
    
    # ==========================================================================
    # Concept Mirror Mode Endpoint
    # ==========================================================================
    
    @app.route("/analyze", methods=["POST"])
    def analyze_concept():
        """
        Concept Mirror analysis endpoint.
        
        Request body:
            {
                "concept": "Binary Search",
                "explanation": "User's explanation of the concept..."
            }
            
        Response:
            {
                "understood": [...],
                "missing": [...],
                "incorrect": [...],
                "assumptions": [...],
                "summary": "..."
            }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            concept_name = data.get("concept", "")
            explanation = data.get("explanation", "")
            
            if not concept_name:
                return jsonify({"error": "Concept name is required"}), 400
            
            if not explanation or len(explanation) < 20:
                return jsonify({
                    "error": "Explanation must be at least 20 characters"
                }), 400
            
            # Check if demo mode or no API key
            if config.demo_mode or not config.has_api_key():
                result = get_concept_mirror_demo_response(concept_name, explanation)
                return jsonify({
                    **result,
                    "provider": "demo",
                    "demo_mode": True
                })
            
            # Get AI client and analyze
            print(f"[ANALYZE] Getting AI client...")
            client = _get_ai_client()
            
            result = client.analyze_concept(concept_name, explanation)
            print(f"[ANALYZE] Result received")
            
            return jsonify({
                **result,
                "provider": config.active_provider,
                "model": client.model,
            })
            
        except Exception as e:
            # Fall back to demo mode on error
            result = get_concept_mirror_demo_response(
                data.get("concept", "") if data else "",
                data.get("explanation", "") if data else ""
            )
            return jsonify({
                **result,
                "provider": "demo",
                "error": str(e),
                "fallback": True
            })
    
    # ==========================================================================
    # Simple Response Endpoint
    # ==========================================================================
    
    @app.route("/generate", methods=["POST"])
    def generate_response():
        """
        Simple text generation endpoint.
        
        Request body:
            {
                "prompt": "Explain DSA in simple terms"
            }
            
        Response:
            {
                "response": "Generated text...",
                "provider": "gemini"
            }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            prompt = data.get("prompt", "")
            
            if not prompt:
                return jsonify({"error": "Prompt is required"}), 400
            
            # Check if demo mode or no API key
            if config.demo_mode or not config.has_api_key():
                return jsonify({
                    "response": f"Demo response for: {prompt[:50]}...",
                    "provider": "demo",
                    "demo_mode": True
                })
            
            # Get AI client and generate
            print(f"[GENERATE] Getting AI client...")
            client = _get_ai_client()
            
            response = client.generate_response(prompt)
            print(f"[GENERATE] Response received")
            
            return jsonify({
                "response": response,
                "provider": config.active_provider,
                "model": client.model,
            })
            
        except Exception as e:
            return jsonify({
                "error": str(e),
                "provider": "error"
            }), 500
    
    return app


# =============================================================================
# Main Entry Point
# =============================================================================

def run_server(
    host: Optional[str] = None,
    port: Optional[int] = None,
    debug: Optional[bool] = None
):
    """
    Run the Flask development server.
    
    Args:
        host: Server host (default from config).
        port: Server port (default from config).
        debug: Debug mode (default from config).
    """
    app = create_app()
    
    app.run(
        host=host or config.flask_host,
        port=port or config.flask_port,
        debug=debug if debug is not None else config.flask_debug,
    )


# Allow running directly: python -m ai_assistant.api
if __name__ == "__main__":
    print("=" * 60)
    print("AI Assistant API Server")
    print("=" * 60)
    print(f"Provider: {config.active_provider}")
    print(f"Model: {config.active_model or 'default'}")
    print(f"API Key: {'configured' if config.has_api_key() else 'NOT configured (demo mode)'}")
    print(f"Demo Mode: {config.demo_mode}")
    print("=" * 60)
    print(f"Starting server at http://{config.flask_host}:{config.flask_port}")
    print("=" * 60)
    
    run_server()
