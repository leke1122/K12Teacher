$body = @{
    subjectId = "geography"
    question = "Test Question - Please Ignore"
    correctAnswer = "A"
    userAnswer = "B"
    analysis = "Test analysis"
    difficulty = "medium"
    knowledgePoint = "test"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://111.229.29.77:3002/api/wrong-questions" -Method POST -ContentType "application/json" -Body $body

Write-Host "Response:"
$response | ConvertTo-Json
