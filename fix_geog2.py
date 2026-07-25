#!/usr/bin/env python3
import re

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove sections TabsContent
# Pattern: from sections comment to before knowledge TabsContent
pattern1 = r'\{\s*/\*\s*章节结构\s*\*/\}.*?<TabsContent value="sections">'
replacement1 = ''
content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

# Find and remove everything from sections TabsContent to before knowledge TabsContent
pattern2 = r'<TabsContent value="sections">.*?<TabsContent value="knowledge">'
replacement2 = '<TabsContent value="knowledge">'
content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

# Remove concepts TabsContent
pattern3 = r'\{\s*/\*\s*概念词典\s*\*/\}.*?</TabsContent>\s*</Tabs>'
replacement3 = '          </Tabs>'
content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
