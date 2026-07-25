#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix missing </TabsList>
content = content.replace(
    '              </TabsTrigger>\n            {/* 必背清单 */}',
    '              </TabsTrigger>\n            </TabsList>\n\n            {/* 必背清单 */}'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
