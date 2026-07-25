#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the sections comment and remove until knowledge marker
marker = '            {/* 章节结构 */}'
knowledge_marker = '            {/* 知识图谱 */}'

start = content.find(marker)
end = content.find(knowledge_marker)

if start != -1 and end != -1:
    # Remove from marker to end of knowledge marker line
    content = content[:start] + content[end:]
    print(f"Removed from position {start} to {end}")
else:
    print(f"Not found: start={start}, end={end}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {file_path}")
