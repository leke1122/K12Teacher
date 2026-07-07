$f = 'E:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx'
$lines = Get-Content -LiteralPath $f
$total = $lines.Count
$keep = @()
for ($i = 0; $i -lt 782 -and $i -lt $total; $i++) {
    $keep += $lines[$i]
}
$keep | Set-Content -LiteralPath $f
Write-Host "Done. Original: $total lines, kept: $($keep.Count) lines"
