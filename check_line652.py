with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'rb') as f:
    content = f.read()
    lines = content.split(b'\n')

# Check exact bytes around lines 649-655
print("=== Lines 649-655 (with hex) ===")
for i in range(648, min(656, len(lines))):
    line = lines[i]
    print(f"\nLine {i+1} ({len(line)} bytes):")
    print(f"  Text: {repr(line)}")
    # Check for any null bytes or other weird characters
    weird = [f"0x{j:02x}@{pos}" for pos, j in enumerate(line) if j < 32 and j not in (9, 10, 13)]
    if weird:
        print(f"  WARNING: Weird chars: {weird}")
