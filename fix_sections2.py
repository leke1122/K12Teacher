#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove the sections and concepts TabsContent
output = []
skip_until_knowledge = False
in_sections_content = False
in_concepts_content = False

for i, line in enumerate(lines):
    # Check for sections TabsContent start
    if '/* 章节结构 */' in line and 'TabsContent' in lines[i-1] if i > 0 else False:
        skip_until_knowledge = True
        in_sections_content = True
        continue
    
    # Check for concepts TabsContent start
    if '/* 概念词典 */' in line and 'TabsContent' in lines[i-1] if i > 0 else False:
        skip_until_knowledge = True
        in_concepts_content = True
        continue
    
    # Check for knowledge TabsContent (stop skipping)
    if skip_until_knowledge and '/* 知识图谱 */' in line:
        skip_until_knowledge = False
        in_sections_content = False
        in_concepts_content = False
    
    # Skip lines between sections/concepts and knowledge
    if skip_until_knowledge:
        continue
    
    output.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(output)

print(f"Fixed {file_path}")
