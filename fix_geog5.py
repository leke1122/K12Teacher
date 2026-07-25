#!/usr/bin/env python3

file_path = '/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove concepts TabsContent (lines 356 onwards until </Tabs>)
start_remove = None
end_remove = None

for i, line in enumerate(lines):
    if '<TabsContent value="concepts">' in line:
        start_remove = i
    if start_remove is not None and '</Tabs>' in line:
        end_remove = i
        break

if start_remove is not None and end_remove is not None:
    print(f"Removing lines {start_remove+1} to {end_remove+1}")
    new_lines = lines[:start_remove] + lines[end_remove:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('Done')
else:
    print(f'Not found: start={start_remove}, end={end_remove}')
