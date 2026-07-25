import os
import subprocess

# SSH 参数
ssh_key = r"C:\Users\Admin\Desktop\lekey.pem"
ssh_user = "ubuntu"
ssh_host = "111.229.29.77"

def scp_upload(local_path, remote_path):
    cmd = ['scp', '-i', ssh_key, local_path, f'{ssh_user}@{ssh_host}:{remote_path}']
    print(f"Uploading: {local_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")

def ssh_exec(cmd):
    full_cmd = ['ssh', '-i', ssh_key, f'{ssh_user}@{ssh_host}', cmd]
    print(f"Exec: {cmd}")
    result = subprocess.run(full_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")

base_path = r"e:\高中自学"

# 上传核心文件
scp_upload(
    os.path.join(base_path, r"src\components\ui\AutoHideHeader.tsx"),
    "/tmp/AutoHideHeader.tsx"
)
scp_upload(
    os.path.join(base_path, r"src\components\layout\MainLayout.tsx"),
    "/tmp/MainLayout.tsx"
)
scp_upload(
    os.path.join(base_path, r"src\app\(main)\layout.tsx"),
    "/tmp/layout_main.tsx"
)

# 上传页面文件
pages = [
    (r"src\app\(main)\learn\page.tsx", "/tmp/learn_page.tsx"),
    (r"src\app\(main)\learn\math\function\page.tsx", "/tmp/math_function_page.tsx"),
    (r"src\app\(main)\learn\math\conclusions\page.tsx", "/tmp/math_conclusions_page.tsx"),
    (r"src\app\(main)\learn\geography\practice\[chapterId]\page.tsx", "/tmp/geog_practice_page.tsx"),
    (r"src\app\(main)\learn\geography\knowledge\[chapterId]\page.tsx", "/tmp/geog_knowledge_page.tsx"),
    (r"src\app\(main)\learn\geography\knowledge-full\[chapterId]\page.tsx", "/tmp/geog_knowledge_full_page.tsx"),
    (r"src\app\(main)\learn\history\knowledge\[chapterId]\page.tsx", "/tmp/history_knowledge_page.tsx"),
    (r"src\app\(main)\learn\politics\knowledge\[chapterId]\page.tsx", "/tmp/politics_knowledge_page.tsx"),
    (r"src\app\(main)\learn\chinese\poetry\page.tsx", "/tmp/chinese_poetry_page.tsx"),
    (r"src\app\(main)\learn\chinese\classical\page.tsx", "/tmp/chinese_classical_page.tsx"),
    (r"src\app\(main)\learn\chinese\language\page.tsx", "/tmp/chinese_language_page.tsx"),
    (r"src\app\(main)\learn\english\listening\page.tsx", "/tmp/english_listening_page.tsx"),
    (r"src\app\(main)\learn\math\visualize\[conceptId]\page.tsx", "/tmp/math_visualize_page.tsx"),
    (r"src\app\(main)\learn\math\function\practice\page.tsx", "/tmp/math_function_practice_page.tsx"),
    (r"src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx", "/tmp/textbook_page.tsx"),
]

for local_rel, remote_path in pages:
    scp_upload(os.path.join(base_path, local_rel), remote_path)

# 复制到目标目录 - 使用引号包围路径
copy_commands = [
    ('/tmp/AutoHideHeader.tsx', '"~/gaozhong/src/components/ui/AutoHideHeader.tsx"'),
    ('/tmp/MainLayout.tsx', '"~/gaozhong/src/components/layout/MainLayout.tsx"'),
    ('/tmp/layout_main.tsx', '~/gaozhong/src/app/\\(main\\)/layout.tsx'),
    ('/tmp/learn_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/page.tsx'),
    ('/tmp/math_function_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/math/function/page.tsx'),
    ('/tmp/math_conclusions_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/math/conclusions/page.tsx'),
    ('/tmp/geog_practice_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/geography/practice/\\[chapterId\\]/page.tsx'),
    ('/tmp/geog_knowledge_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/geography/knowledge/\\[chapterId\\]/page.tsx'),
    ('/tmp/geog_knowledge_full_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/geography/knowledge-full/\\[chapterId\\]/page.tsx'),
    ('/tmp/history_knowledge_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/history/knowledge/\\[chapterId\\]/page.tsx'),
    ('/tmp/politics_knowledge_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/politics/knowledge/\\[chapterId\\]/page.tsx'),
    ('/tmp/chinese_poetry_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/chinese/poetry/page.tsx'),
    ('/tmp/chinese_classical_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/chinese/classical/page.tsx'),
    ('/tmp/chinese_language_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/chinese/language/page.tsx'),
    ('/tmp/english_listening_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/english/listening/page.tsx'),
    ('/tmp/math_visualize_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/math/visualize/\\[conceptId\\]/page.tsx'),
    ('/tmp/math_function_practice_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/math/function/practice/page.tsx'),
    ('/tmp/textbook_page.tsx', '~/gaozhong/src/app/\\(main\\)/learn/textbook/\\[subjectId\\]/\\[chapterId\\]/\\[sectionId\\]/page.tsx'),
]

for src, dest in copy_commands:
    ssh_exec(f'cp {src} {dest}')

print("All done!")
