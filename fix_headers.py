import os
import re

# 需要修改的文件列表（相对于项目根目录）
files_to_modify = [
    r"src\app\(main)\learn\math\geogebra\model\[modelId]\page.tsx",
    r"src\app\(main)\learn\page.tsx",
    r"src\app\(main)\learn\math\visualize\[conceptId]\page.tsx",
    r"src\app\(main)\learn\politics\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\geography\knowledge-full\[chapterId]\page.tsx",
    r"src\app\(main)\learn\math\conclusions\page.tsx",
    r"src\app\(main)\learn\chinese\classical\page.tsx",
    r"src\app\(main)\learn\geography\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\chinese\poetry\[poemId]\page.tsx",
    r"src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx",
    r"src\app\(main)\learn\chinese\reading\[chapterId]\page.tsx",
    r"src\app\(main)\learn\chinese\classical\[poemId]\page.tsx",
    r"src\app\(main)\learn\geography\practice\[chapterId]\page.tsx",
    r"src\app\(main)\learn\math\function\practice\page.tsx",
    r"src\app\(main)\learn\chinese\poetry\page.tsx",
    r"src\app\(main)\learn\math\function\page.tsx",
    r"src\app\(main)\learn\english\listening\page.tsx",
    r"src\app\(main)\learn\chinese\language\page.tsx",
    r"src\app\(main)\learn\history\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\history\unit\[unitId]\page.tsx",
    r"src\app\(main)\learn\history\guided\page.tsx",
    r"src\app\(main)\learn\history\liaoning\page.tsx",
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经导入 AutoHideHeader
    has_import = 'from \'@/components/ui/AutoHideHeader\'' in content or 'from "@/components/ui/AutoHideHeader"' in content
    
    if not has_import:
        # 添加 import
        # 在最后一个 import 语句后添加
        lines = content.split('\n')
        last_import_idx = -1
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip().startswith('import ') and 'from' in lines[i]:
                last_import_idx = i
                break
        
        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, "import { AutoHideHeader } from '@/components/ui/AutoHideHeader';")
            content = '\n'.join(lines)
    
    # 替换 <header className= 为 <AutoHideHeader><header className=
    # 需要找到所有 <header 开头的行，并添加包裹
    
    # 匹配 <header className="..."> 这种模式
    # 替换为 <AutoHideHeader><header className="...">
    content = re.sub(
        r"(<header\s+className=\"[^\"]*\")",
        r"<AutoHideHeader>\1",
        content
    )
    
    # 匹配 </header> 结尾
    content = re.sub(
        r"(</header>)",
        r"\1</AutoHideHeader>",
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Modified: {filepath}")

# 项目根目录
base_path = r"e:\高中自学"

for rel_path in files_to_modify:
    filepath = os.path.join(base_path, rel_path)
    if os.path.exists(filepath):
        process_file(filepath)
    else:
        # 尝试替换路径分隔符
        filepath2 = filepath.replace('\\', '/')
        if os.path.exists(filepath2):
            process_file(filepath2)
        else:
            print(f"Not found: {filepath}")

print("Done!")
