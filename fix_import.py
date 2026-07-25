#!/usr/bin/env python3
import sys

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the import line
old_import = """import { 
  ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen, 
  Star, GitFork, CalendarDays, Brain, BookMarked, CheckCircle2
} from 'lucide-react';"""

new_import = """import { 
  ArrowLeft, Loader2, Sparkles, GitFork, Brain, BookOpen, CheckCircle2, Star
} from 'lucide-react';"""

content = content.replace(old_import, new_import)

# Also remove sections and concepts tabs
old_tabs = """<TabsTrigger value="sections" className="gap-1">
                <Layers className="h-4 w-4" />
                章节结构
              </TabsTrigger>
              <TabsTrigger value="concepts" className="gap-1">
                <BookMarked className="h-4 w-4" />
                概念词典
              </TabsTrigger>"""

new_tabs = ""

content = content.replace(old_tabs, new_tabs)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {file_path}")
