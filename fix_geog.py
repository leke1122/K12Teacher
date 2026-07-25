#!/usr/bin/env python3
import re

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix imports - use simple replace
content = content.replace(
    'ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen, \n  Star, GitFork, CalendarDays, Brain, BookMarked, CheckCircle2',
    'ArrowLeft, Loader2, Sparkles, GitFork, Brain, BookOpen, CheckCircle2, Star'
)

# Remove TabsTrigger for sections and concepts
lines = content.split('\n')
new_lines = []
skip_tabs = 0

for i, line in enumerate(lines):
    # Skip the sections TabsTrigger
    if '<TabsTrigger value="sections"' in line:
        skip_tabs = 5  # Skip this and next 4 lines
        continue
    # Skip the concepts TabsTrigger
    if '<TabsTrigger value="concepts"' in line:
        skip_tabs = 5
        continue
    
    if skip_tabs > 0:
        skip_tabs -= 1
        continue
    
    # Remove sections and concepts TabsContent
    if '/* 章节结构 */' in line or '/* 概念词典 */' in line:
        # Skip until we find a knowledge marker or closing tag
        if '<TabsContent value="knowledge">' in line or '</Tabs>' in line:
            new_lines.append(line)
        continue
    
    new_lines.append(line)

content = '\n'.join(new_lines)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
