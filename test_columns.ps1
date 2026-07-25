$headers = @{
    "apikey" = "sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2"
    "Authorization" = "Bearer sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2"
    "Content-Type" = "application/json"
}

# 获取表结构
$columns = Invoke-RestMethod -Uri "https://hcflszvrefjpfziehvfe.supabase.co/rest/v1/wrong_questions?select=*&limit=1" -Method GET -Headers $headers

Write-Host "Table columns:"
$columns[0].PSObject.Properties.Name | ForEach-Object { Write-Host $_ }
