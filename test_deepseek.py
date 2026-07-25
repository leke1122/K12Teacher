import requests
import json

api_key = "sk-57122aa54d164a86bb38d09bc87dfdf9"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
}

try:
    response = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers=headers,
        json=data,
        timeout=30
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
