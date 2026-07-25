$apiKey = "sk-77098e26ad174e4f849312b136b7a062"

# Test 1: deepseek-v4-flash
Write-Host "Test 1: deepseek-v4-flash" -ForegroundColor Cyan
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $apiKey"
}

$body = @{
    model = "deepseek-v4-flash"
    messages = @(@{role = "user"; content = "你好"})
    max_tokens = 50
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.deepseek.com/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Model: $($response.model)"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Body: $body"
    } catch {}
}

Write-Host ""
Write-Host "Test 2: deepseek-chat (legacy)" -ForegroundColor Cyan

$body2 = @{
    model = "deepseek-chat"
    messages = @(@{role = "user"; content = "你好"})
    max_tokens = 50
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.deepseek.com/chat/completions" -Method Post -Headers $headers -Body $body2
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Model: $($response.model)"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Body: $body"
    } catch {}
}

Write-Host ""
Write-Host "Test 3: List models" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.deepseek.com/models" -Method Get -Headers @{Authorization = "Bearer $apiKey"}
    Write-Host "Available models:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Body: $body"
    } catch {}
}
