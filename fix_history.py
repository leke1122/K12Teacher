#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/history/timeline/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add BookOpen to imports
old = 'RefreshCw,\n  Send,'
new = 'RefreshCw,\n  BookOpen,\n  Send,'
content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
