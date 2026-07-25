#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for the pattern (matching Chinese chars with UTF-8 bytes)
import re

# Match from "章节结构" comment to "知识图谱" comment
pattern = r'\{/\* .*章节结构.* \*/\}.*?<TabsContent value="sections">.*?\{/\* 知识图谱 \*/\}'
content_new = re.sub(pattern, '{/* 知识图谱 */}', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content_new)

print(f"Fixed {file_path}")
