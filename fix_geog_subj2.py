#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/subjects/geography/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix remaining BookOpen reference (used for "选择章节" icon)
content = content.replace(
    '<BookOpen className="h-4 w-4 text-emerald-500" />',
    '<Globe2 className="h-4 w-4 text-emerald-500" />'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
