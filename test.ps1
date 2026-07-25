$body = '{"test":1}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$response = Invoke-WebRequest -Uri 'http://111.229.29.77:3002/api/history/guided-learning/test' -Method Post -ContentType 'application/json' -Body $bytes
Write-Output $response.Content
