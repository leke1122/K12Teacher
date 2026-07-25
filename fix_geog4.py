#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove concepts content
start_remove = None
end_remove = None

for i, line in enumerate(lines):
    if '/* 概念词典 */' in line:
        start_remove = i
    if start_remove is not None and '</TabsContent>' in line and end_remove is None:
        end_remove = i + 1
        break

if start_remove is not None and end_remove is not None:
    print(f"Removing lines {start_remove+1} to {end_remove}")
    new_lines = lines[:start_remove] + lines[end_remove:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('Done')
else:
    print('Not found')
