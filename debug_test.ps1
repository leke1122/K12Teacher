$body = '{"unitId":"u1","knowledgePointId":"kp-1-6","knowledgePoint":"夏朝建立","knowledgeDescription":"约前2070年，禹建立夏朝","difficulty":"easy"}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Write-Output "Body length: $($body.Length)"
Write-Output "Bytes length: $($bytes.Length)"
Write-Output "First 120 bytes:"
for ($i = 0; $i -lt [Math]::Min(120, $bytes.Length); $i++) {
    Write-Output "$i : $($bytes[$i]) : $([char]$bytes[$i])"
}
$response = Invoke-WebRequest -Uri 'http://111.229.29.77:3002/api/history/guided-learning/test' -Method Post -ContentType 'application/json' -Body $bytes
Write-Output $response.Content
