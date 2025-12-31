import base64
import os
import json

def generate_firebase_key():
    file_path = "serviceAccountKey.json"
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found. Please place your Firebase service account JSON file in the root directory.")
        return

    try:
        with open(file_path, "rb") as f:
            content = f.read()
            encoded = base64.b64encode(content).decode("utf-8")
            
        print("\n" + "="*60)
        print("FIREBASE BASE64 KEY GENERATOR")
        print("="*60)
        print("Copy the following string and set it as FIREBASE_SERVICE_ACCOUNT_BASE64 in your .env file:")
        print("-" * 60)
        print(encoded)
        print("-" * 60)
        
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    generate_firebase_key()
