$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer sk-57122aa54d164a86bb38d09bc87dfdf9"
}

$body = @{
    model = "deepseek-v4-flash"
    messages = @(@{role = "user"; content = "Hello"})
    max_tokens = 10
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://api.deepseek.com/chat/completions" -Method Post -Headers $headers -Body $body
Write-Host $response
