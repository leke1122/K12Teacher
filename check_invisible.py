with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'rb') as f:
    content = f.read()
    lines = content.split(b'\n')

# Check for invisible/control characters in lines 650-656
print("=== Checking lines 650-656 for invisible characters ===")
for i in range(649, min(657, len(lines))):
    line = lines[i]
    print(f"\nLine {i+1} ({len(line)} bytes): {repr(line)}")
    for pos, byte in enumerate(line):
        if byte < 32 and byte not in (9, 10, 13):  # Not tab, newline, carriage return
            print(f"  INVISIBLE CHAR at position {pos}: 0x{byte:02x}")
        elif byte > 127:
            print(f"  HIGH BYTE at position {pos}: 0x{byte:02x}")

# Also check for zero-width characters (common in Chinese text)
print("\n=== Checking for zero-width characters in entire file ===")
zw_chars = {
    '\u200b': 'Zero-width space',
    '\u200c': 'Zero-width non-joiner',
    '\u200d': 'Zero-width joiner',
    '\u2060': 'Word joiner',
    '\ufeff': 'BOM / Zero-width no-break space',
}

found_any = False
with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
    for char, name in zw_chars.items():
        if char in text:
            pos = text.index(char)
            print(f"Found {name} (U+{ord(char):04X}) at position {pos}")
            found_any = True

if not found_any:
    print("No zero-width characters found")
