with open(r'e:\高中自学\src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check for backtick balance
backticks = content.count('`')
print(f'Backticks: {backticks} (should be even)')

# Check for single quote balance  
single_quotes = content.count("'")
print(f'Single quotes: {single_quotes}')

# Check for double quote balance
double_quotes = content.count('"')
print(f'Double quotes: {double_quotes}')

# Find positions of all backticks
import re
positions = [m.start() for m in re.finditer('`', content)]
print(f'Backtick positions: {positions[:20]}')

# Show context around each backtick
for pos in positions[:20]:
    start = max(0, pos - 30)
    end = min(len(content), pos + 30)
    print(f'  At {pos}: ...{content[start:end]}...')
