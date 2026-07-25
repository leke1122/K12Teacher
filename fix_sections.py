#!/usr/bin/env python3
import sys
import re

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the sections tab content
sections_pattern = r'\{\/\* 章节结构 \*\/\}[\s\S]*?\{\/\* 概念词典 \*\/\}[\s\S]*?\{\/\* 概念词典 \*\/[\s\S]*?\{\/\* 知识图谱 \*\/\}'
content = re.sub(sections_pattern, '{/* 知识图谱 */}', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed sections content in {file_path}")
