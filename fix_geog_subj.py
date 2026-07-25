#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/subjects/geography/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix imports - remove BookOpen
content = content.replace(
    'Globe2, BookOpen, Brain, MapPin, FileQuestion, Sparkles, ArrowRight',
    'Globe2, Brain, MapPin, FileQuestion, Sparkles, ArrowRight'
)

# 2. Remove textbook from LEARNING_STEPS
old_steps = "  { id: 'textbook', icon: BookOpen, name: '课本', desc: '基础内容学习', color: 'amber' },\n  { id: 'knowledge',"
new_steps = "  { id: 'knowledge',"
content = content.replace(old_steps, new_steps)

# 3. Remove textbook case in getStepLink
old_case = "      case 'textbook':\n        return `/learn/geography/textbook/${selectedChapter.id}`;\n      case 'knowledge':"
new_case = "      case 'knowledge':"
content = content.replace(old_case, new_case)

# 4. Fix the path hint
content = content.replace(
    '建议按顺序完成：课本 → 知识点 → 练习',
    '建议按顺序完成：知识点 → 练习'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
