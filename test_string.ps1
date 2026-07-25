$body = '{"unitId":"u1","knowledgePointId":"kp-1-6","knowledgePoint":"夏朝建立","knowledgeDescription":"约前2070年，禹建立夏朝","difficulty":"easy"}'
$response = Invoke-WebRequest -Uri 'http://111.229.29.77:3002/api/history/guided-learning/test' -Method Post -ContentType 'application/json; charset=utf-8' -Body $body
Write-Output $response.Content
