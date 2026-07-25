import os
import re

# 需要优化宽度的页面
files_to_optimize = [
    r"src\app\(main)\learn\page.tsx",
    r"src\app\(main)\learn\geography\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\geography\practice\[chapterId]\page.tsx",
    r"src\app\(main)\learn\geography\knowledge-full\[chapterId]\page.tsx",
    r"src\app\(main)\learn\math\function\page.tsx",
    r"src\app\(main)\learn\math\conclusions\page.tsx",
    r"src\app\(main)\learn\math\visualize\[conceptId]\page.tsx",
    r"src\app\(main)\learn\history\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\politics\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx",
    r"src\app\(main)\learn\chinese\poetry\page.tsx",
    r"src\app\(main)\learn\chinese\poetry\[poemId]\page.tsx",
    r"src\app\(main)\learn\chinese\classical\page.tsx",
    r"src\app\(main)\learn\chinese\classical\[poemId]\page.tsx",
    r"src\app\(main)\learn\chinese\language\page.tsx",
    r"src\app\(main)\learn\english\listening\page.tsx",
    r"src\app\(main)\learn\math\geogebra\model\[modelId]\page.tsx",
    r"src\app\(main)\learn\math\function\practice\page.tsx",
]

# 宽度替换规则：从小到大
width_replacements = [
    (r'max-w-4xl', 'max-w-[1400px]'),
    (r'max-w-5xl', 'max-w-[1400px]'),
    (r'max-w-6xl', 'max-w-[1400px]'),
    (r'max-w-7xl', 'max-w-[1400px]'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    for old, new in width_replacements:
        content = re.sub(old, new, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Optimized: {filepath}")
    else:
        print(f"No change: {filepath}")

base_path = r"e:\高中自学"

for rel_path in files_to_optimize:
    filepath = os.path.join(base_path, rel_path)
    if os.path.exists(filepath):
        process_file(filepath)
    else:
        print(f"Not found: {filepath}")

print("Done!")
