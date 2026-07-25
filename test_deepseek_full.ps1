$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer sk-57122aa54d164a86bb38d09bc87dfdf9"
}

$body = @{
    model = "deepseek-v4-flash"
    messages = @(@{role = "user"; content = "你好"})
    max_tokens = 50
} | ConvertTo-Json -Depth 10

Write-Host "Testing DeepSeek API..."
Write-Host "URL: https://api.deepseek.com/chat/completions"
Write-Host "Model: deepseek-v4-flash"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://api.deepseek.com/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "Success!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host ""
    
    # Try to read error body
    try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response Body: $responseBody"
    } catch {
        Write-Host "Could not read response body"
    }
}
