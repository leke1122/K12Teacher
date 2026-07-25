#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find start and end lines to remove
start_remove = None
end_remove = None

for i, line in enumerate(lines):
    # Find sections TabsContent
    if '<TabsContent value="sections">' in line and start_remove is None:
        # Go back to find the comment
        for j in range(i-1, -1, -1):
            if '章节结构' in lines[j]:
                start_remove = j
                break
        if start_remove is None:
            start_remove = i
    # Find end of sections TabsContent
    if start_remove is not None and end_remove is None and '</TabsContent>' in line:
        # Check if this is the end of sections
        if i > start_remove:
            end_remove = i + 1
            break

print(f"Removing lines {start_remove+1} to {end_remove}")

# Remove sections content
new_lines = lines[:start_remove] + lines[end_remove:]

# Now find and remove concepts content
start_remove2 = None
end_remove2 = None

for i, line in enumerate(new_lines):
    if '/* 概念词典 */' in line:
        start_remove2 = i
    if start_remove2 is not None and '</TabsContent>' in line and end_remove2 is None:
        end_remove2 = i + 1
        break

if start_remove2 is not None and end_remove2 is not None:
    print(f"Removing lines {start_remove2+1} to {end_remove2}")
    new_lines = new_lines[:start_remove2] + new_lines[end_remove2:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done')
