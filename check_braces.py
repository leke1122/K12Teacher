with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Track brace depth per line
depth = 0
max_depth = 0
for i, line in enumerate(lines):
    # Count braces (excluding those in strings/comments is complex, so just do raw count)
    opens = line.count('{')
    closes = line.count('}')
    depth += opens - closes
    if depth > max_depth:
        max_depth = depth
    if depth < 0:
        print(f"NEGATIVE DEPTH at line {i+1}: {line.rstrip()}")
        break

print(f"Final depth: {depth}")
print(f"Max depth: {max_depth}")

# Show depth around problematic area
print("\nDepth around line 630-660:")
depth2 = 0
for i in range(629, min(660, len(lines))):
    line = lines[i]
    opens = line.count('{')
    closes = line.count('}')
    depth2 += opens - closes
    print(f"  {i+1}: depth={depth2:3d} | {line.rstrip()[:100]}")
