import requests
import json

url = "http://111.229.29.77:3002/api/history/guided-learning/generate-quiz"
data = {
    "unitId": "u1",
    "knowledgePointId": "kp-1-6",
    "knowledgePoint": "夏朝建立",
    "knowledgeDescription": "约前2070年，禹建立夏朝",
    "difficulty": "easy"
}

response = requests.post(url, json=data)
print(response.text)
