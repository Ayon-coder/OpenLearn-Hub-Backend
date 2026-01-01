
import requests
import json
import sys

def test_backend():
    print("Testing Backend Connection...")
    try:
        # 1. Health Check
        print("\n1. Checking /health...")
        health = requests.get("http://127.0.0.1:5050/health", timeout=2)
        print(f"Status: {health.status_code}")
        print(f"Response: {json.dumps(health.json(), indent=2)}")
        
        if health.status_code != 200:
            print("❌ Backend not healthy!")
            return

        # 2. Generate Check
        print("\n2. Checking /generate (Test Prompt)...")
        payload = {"prompt": "Hello, are you working?"}
        gen = requests.post("http://127.0.0.1:5050/generate", json=payload, timeout=10)
        
        print(f"Status: {gen.status_code}")
        print(f"Response: {json.dumps(gen.json(), indent=2)}")
        
        if gen.json().get("provider") == "demo":
            print("\n⚠️  WARNING: Backend is returning DEMO responses.")
            print("Possible reasons:")
            print(" - API Key is missing or invalid")
            print(" - Model name is incorrect (Groq rejected it)")
            print(" - Rate limit exceeded")
            print("Check the terminal where 'python run.py' is running for the [ERROR] log.")
        else:
            print("\n✅ Success! Real AI response received.")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Refused! Is the backend running on port 5050?")
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")

if __name__ == "__main__":
    test_backend()
