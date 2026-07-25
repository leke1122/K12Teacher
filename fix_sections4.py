#!/usr/bin/env python3
import sys
import re

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the line number for "章节结构"
lines = content.split('\n')
start_line = None
end_line = None

for i, line in enumerate(lines):
    if '章节结构' in line and 'TabsContent' not in line:
        # Find the TabsContent line before this
        for j in range(i-1, -1, -1):
            if 'TabsContent' in lines[j] and 'value="sections"' in lines[j]:
                start_line = j
                break
        if start_line is not None:
            break

# Find where "知识图谱" section starts
knowledge_line = None
for i, line in enumerate(lines):
    if '知识图谱' in line and '/*' in line:
        knowledge_line = i
        break

if start_line is not None and knowledge_line is not None:
    # Keep lines up to start_line, skip until knowledge_line
    new_lines = lines[:start_line] + lines[knowledge_line:]
    content = '\n'.join(new_lines)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {file_path}")
