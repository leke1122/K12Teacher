#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the TabsContent for sections and remove it
import re

# Pattern to match from "            {/* 章节结构 */}\n            <TabsContent value="sections">" 
# to the closing "</TabsContent>" before "/* 知识图谱 */"
pattern = r'\{/\* 章节结构 \*/\}\s*<TabsContent value="sections">[\s\S]*?\{/\* 知识图谱 \*/\}'
replacement = '{/* 知识图谱 */}'
content = re.sub(pattern, replacement, content)

# Also remove the concepts TabsContent
pattern2 = r'\{/\* 概念词典 \*/\}\s*<TabsContent value="concepts">[\s\S]*?</TabsContent>\s*</Tabs>'
replacement2 = ''
content = re.sub(pattern2, replacement2, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {file_path}")
