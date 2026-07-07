with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'rb') as f:
    first_bytes = f.read(10)
    print(f"First 10 bytes: {first_bytes.hex()}")
    print(f"First 10 bytes: {first_bytes}")
    
    # Check for BOM
    if first_bytes[:3] == b'\xef\xbb\xbf':
        print("WARNING: File has UTF-8 BOM!")
    elif first_bytes[:2] == b'\xff\xfe':
        print("WARNING: File has UTF-16 LE BOM!")
    elif first_bytes[:2] == b'\xfe\xff':
        print("WARNING: File has UTF-16 BE BOM!")
    else:
        print("No BOM detected")
