#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the import line
old_import = """import { 
  ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen, 
  Star, GitFork, CalendarDays, Brain, BookMarked, CheckCircle2
} from 'lucide-react';"""

new_import = """import { 
  ArrowLeft, Loader2, Sparkles, GitFork, Brain, BookOpen, CheckCircle2, Star
} from 'lucide-react';"""

content = content.replace(old_import, new_import)

# 2. Remove the sections and concepts TabsTrigger
old_triggers = """              <TabsTrigger value="sections" className="gap-1">
                <Layers className="h-4 w-4" />
                章节结构
              </TabsTrigger>
              <TabsTrigger value="concepts" className="gap-1">
                <BookMarked className="h-4 w-4" />
                概念词典
              </TabsTrigger>"""

content = content.replace(old_triggers, '')

# 3. Remove the sections and concepts TabsContent
# Find and remove content between them
marker1 = '            {/* 章节结构 */}\n            <TabsContent value="sections">'
marker2 = '            {/* 知识图谱 */}\n            <TabsContent value="knowledge">'

start_idx = content.find(marker1)
end_idx = content.find(marker2)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + marker2 + content[end_idx + len(marker2):]

# Also remove concepts TabsContent
marker3 = '            {/* 概念词典 */}\n            <TabsContent value="concepts">'
end_marker = '          </Tabs>\n'
end_idx2 = content.find(marker3)
if end_idx2 != -1:
    end_idx3 = content.find(end_marker, end_idx2)
    if end_idx3 != -1:
        content = content[:end_idx2] + end_marker + content[end_idx3 + len(end_marker):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {file_path}")
