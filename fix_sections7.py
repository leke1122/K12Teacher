#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove everything from "{/* 章节结构 */}" to "{/* 知识图谱 */}"
marker1 = '{/* 章节结构 */}'
marker2 = '{/* 知识图谱 */}'

start_idx = content.find(marker1)
end_idx = content.find(marker2)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Fixed: removed lines from position {start_idx} to {end_idx}")
else:
    print(f"Not found: marker1={start_idx}, marker2={end_idx}")
