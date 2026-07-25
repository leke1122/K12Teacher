#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/history/timeline/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add GraduationCap to imports
old = 'AlertCircle,\n  Star,'
new = 'AlertCircle,\n  GraduationCap,\n  Star,'
content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
