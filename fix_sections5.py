#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where sections starts and knowledge ends
start_del = None
end_del = None

for i, line in enumerate(lines):
    if '{/* 章节结构 */}' in line:
        start_del = i
    if start_del is not None and '{/* 知识图谱 */}' in line and i > start_del:
        end_del = i
        break

if start_del is not None and end_del is not None:
    # Delete lines from start_del to end_del-1 (keep the knowledge line)
    new_lines = lines[:start_del] + lines[end_del:]
    content = '\n'.join(new_lines)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Deleted lines {start_del+1} to {end_del} in {file_path}")
else:
    print(f"Not found: start={start_del}, end={end_del}")
