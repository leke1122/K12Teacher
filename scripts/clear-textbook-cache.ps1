# 清理课本还原相关缓存
# 运行前请先保存工作进度

Write-Host "正在清理课本还原缓存..." -ForegroundColor Cyan

# 清理课本还原学习进度
Write-Host "`n1. 清理课本还原学习进度..." -ForegroundColor Yellow
$progressKeys = @(
    'edumind_textbook_progress_math_1_1.1.1',
    'edumind_textbook_progress_math_1_1.2',
    'edumind_textbook_progress_math_1_1.3',
    'edumind_textbook_progress_math_1_1'
)
foreach ($key in $progressKeys) {
    $localKey = $key
    if (Test-Path ".\$localKey") {
        Remove-Item ".\$localKey"
        Write-Host "  已删除: $localKey" -ForegroundColor Green
    } else {
        Write-Host "  未找到: $localKey" -ForegroundColor Gray
    }
}

# 清理 PDF 缓存
Write-Host "`n2. 清理 PDF 缓存..." -ForegroundColor Yellow
$pdfKeys = @('pdf_math', 'edumind_fallback_pdf_math')
foreach ($key in $pdfKeys) {
    $localKey = $key
    if (Test-Path ".\$localKey") {
        Remove-Item ".\$localKey"
        Write-Host "  已删除: $localKey" -ForegroundColor Green
    } else {
        Write-Host "  未找到: $localKey" -ForegroundColor Gray
    }
}

# 清理章节缓存
Write-Host "`n3. 清理章节缓存..." -ForegroundColor Yellow
$chapterKeys = @('chapters_math', 'edumind_fallback_chapters_math')
foreach ($key in $chapterKeys) {
    $localKey = $key
    if (Test-Path ".\$localKey") {
        Remove-Item ".\$localKey"
        Write-Host "  已删除: $localKey" -ForegroundColor Green
    } else {
        Write-Host "  未找到: $localKey" -ForegroundColor Gray
    }
}

Write-Host "`n缓存清理完成！" -ForegroundColor Cyan
Write-Host "`n注意：浏览器 localStorage 中的缓存需要通过浏览器开发者工具手动清除，或执行以下操作：" -ForegroundColor Yellow
Write-Host "  1. 打开浏览器开发者工具 (F12)" -ForegroundColor Gray
Write-Host "  2. Application -> Local Storage -> http://localhost:3000" -ForegroundColor Gray
Write-Host "  3. 删除所有以 'edumind_' 开头的键" -ForegroundColor Gray
