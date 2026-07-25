$headers = @{
    "apikey" = "sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2"
    "Authorization" = "Bearer sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$body = @{
    user_id = "test-user-debug"
    subject_id = "geography"
    question = "Debug Test Question"
    correct_answer = "A"
    user_answer = "B"
    analysis = "Test"
    difficulty = "medium"
    knowledge_point = "test"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://hcflszvrefjpfziehvfe.supabase.co/rest/v1/wrong_questions" -Method POST -Headers $headers -Body $body

Write-Host "Response:"
$response | ConvertTo-Json
