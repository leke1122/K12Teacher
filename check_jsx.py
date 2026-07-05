with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all JSX opening tags and check if they're properly closed
import re

# Find all self-closing or paired tags
lines = content.split('\n')

# Check each line for potential issues
for i, line in enumerate(lines):
    # Skip empty lines and pure JS/TS lines
    stripped = line.strip()
    if not stripped or stripped.startswith('//') or stripped.startswith('/*'):
        continue
    
    # Count < and > in the line (excluding template literals)
    # This is a rough check
    lt_count = line.count('<')
    gt_count = line.count('>')
    
    # Check for obvious issues
    if lt_count != gt_count:
        # But this could be false positive for multi-line JSX
        pass

# Let's check for unclosed template literals or expressions
# by looking at the structure around line 652
print("Checking structure around line 652...")
for i in range(630, min(660, len(lines))):
    line = lines[i]
    print(f"{i+1}: {line.rstrip()}")

# Check if there's a missing closing tag by looking at the return statement structure
print("\n\nLooking for potential JSX issues...")
# Find the main return statement
main_return_start = content.find('  return (')
if main_return_start != -1:
    print(f"Main return found at position {main_return_start}")
    # Count opening and closing divs in the main return
    return_content = content[main_return_start:]
    open_divs = return_content.count('<div')
    close_divs = return_content.count('</div>')
    print(f"Open divs: {open_divs}, Close divs: {close_divs}")
    
    open_cards = return_content.count('<Card')
    close_cards = return_content.count('</Card>')
    print(f"Open cards: {open_cards}, Close cards: {close_cards}")
