$body = '{"unitId":"u1","knowledgePointId":"kp-1-6","knowledgePoint":"夏朝建立","knowledgeDescription":"约前2070年，禹建立夏朝","difficulty":"easy"}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$response = Invoke-WebRequest -Uri 'http://111.229.29.77:3002/api/history/guided-learning/test' -Method Post -ContentType 'application/json' -Body $bytes
Write-Output $response.Content
