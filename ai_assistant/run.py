"""
Run script for the AI Assistant backend server.

Usage:
    python run.py
"""

import sys
import os

# Add the ai_assistant directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Also add parent directory to find shared .env
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Load environment variables from parent .env
from dotenv import load_dotenv
env_path = os.path.join(parent_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    local_env = os.path.join(current_dir, '.env')
    if os.path.exists(local_env):
        load_dotenv(local_env)

# Now import using absolute imports (will work because we added to sys.path)
from config import config
from demo import get_mentor_demo_response, get_concept_mirror_demo_response

# Flask app creation
from flask import Flask, request, jsonify
from flask_cors import CORS

def get_ai_client():
    """Get an AI client based on configuration."""
    try:
        if config.active_provider == "gemini":
            from gemini_provider.client import GeminiClient
            return GeminiClient()
        elif config.active_provider == "groq":
            from groq_provider.client import GroqClient
            return GroqClient()
        else:
            raise ValueError(f"Unknown provider: {config.active_provider}")
    except Exception as e:
        print(f"[ERROR] Failed to create AI client: {e}")
        import traceback
        traceback.print_exc()
        raise

def create_app():
    """Create Flask application."""
    app = Flask(__name__)
    # Allow all origins for development to prevent CORS issues
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    @app.route("/", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "ai-assistant",
            "provider": config.active_provider,
            "model": config.active_model,
            "has_api_key": config.has_api_key(),
            "demo_mode": config.demo_mode,
        })
    
    @app.route("/config", methods=["GET"])
    def get_config():
        return jsonify(config.to_dict())
    
    @app.route("/mentor", methods=["POST"])
    def mentor_chat():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            messages = data.get("messages", [])
            topic = data.get("topic", "General")
            
            if not messages:
                return jsonify({"error": "Messages array is required"}), 400
            
            # Demo mode or no API key
            if config.demo_mode or not config.has_api_key():
                response = get_mentor_demo_response(messages, topic)
                return jsonify({
                    "response": response,
                    "provider": "demo",
                    "demo_mode": True
                })
            
            # Use real AI
            client = get_ai_client()
            response = client.chat(messages, topic)
            
            return jsonify({
                "response": response,
                "provider": config.active_provider,
                "model": client.model,
            })
            
        except Exception as e:
            print(f"[MENTOR ERROR] {e}")
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
    
    @app.route("/analyze", methods=["POST"])
    def analyze_concept():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            concept_name = data.get("concept", "")
            explanation = data.get("explanation", "")
            
            if not concept_name:
                return jsonify({"error": "Concept name is required"}), 400
            
            if not explanation or len(explanation) < 20:
                return jsonify({"error": "Explanation must be at least 20 characters"}), 400
            
            # Demo mode or no API key
            if config.demo_mode or not config.has_api_key():
                result = get_concept_mirror_demo_response(concept_name, explanation)
                return jsonify({
                    **result,
                    "provider": "demo",
                    "demo_mode": True
                })
            
            # Use real AI
            client = get_ai_client()
            result = client.analyze_concept(concept_name, explanation)
            
            return jsonify({
                **result,
                "provider": config.active_provider,
                "model": client.model,
            })
            
        except Exception as e:
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
    
    @app.route("/generate", methods=["POST"])
    def generate_response():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            prompt = data.get("prompt", "")
            if not prompt:
                return jsonify({"error": "Prompt is required"}), 400
            
            if config.demo_mode or not config.has_api_key():
                return jsonify({
                    "response": f"Demo response for: {prompt[:50]}...",
                    "provider": "demo",
                    "demo_mode": True
                })
            
            client = get_ai_client()
            response = client.generate_response(prompt)
            
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


if __name__ == "__main__":
    print("=" * 60)
    print("AI Assistant API Server (OpenLearn-Hub)")
    print("=" * 60)
    print(f"Provider: {config.active_provider}")
    print(f"Model: {config.active_model or 'default'}")
    print(f"API Key: {'configured' if config.has_api_key() else 'NOT configured (demo mode)'}")
    print(f"Demo Mode: {config.demo_mode}")
    print("=" * 60)
    print(f"Starting server at http://{config.flask_host}:{config.flask_port}")
    print("=" * 60)
    
    app = create_app()
    app.run(
        host=config.flask_host,
        port=config.flask_port,
        debug=config.flask_debug,
    )
