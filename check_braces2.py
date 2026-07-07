with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Track brace depth per line
print("Depth around line 550-635:")
depth = 0
for i in range(549, min(635, len(lines))):
    line = lines[i]
    opens = line.count('{')
    closes = line.count('}')
    prev_depth = depth
    depth += opens - closes
    # Only print lines where depth changes or is problematic
    if opens > 0 or closes > 0 or depth < 0 or (i >= 628 and i <= 655):
        marker = " ***" if depth < 0 else ""
        print(f"  {i+1}: depth={depth:3d} (was {prev_depth:3d}, +{opens}-{closes}) | {line.rstrip()[:120]}{marker}")
