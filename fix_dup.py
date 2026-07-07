fpath = r'E:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx'
with open(fpath, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f'Original: {len(lines)} lines')
kept = lines[:782]
with open(fpath, 'w', encoding='utf-8') as f:
    f.writelines(kept)
print(f'Kept: {len(kept)} lines')
