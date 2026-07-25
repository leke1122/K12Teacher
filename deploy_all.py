import os
import subprocess

ssh_key = r"C:\Users\Admin\Desktop\lekey.pem"
ssh_user = "ubuntu"
ssh_host = "111.229.29.77"
base_path = r"e:\高中自学"

def scp_to_server(local_path, remote_path):
    cmd = ['scp', '-i', ssh_key, local_path, f'{ssh_user}@{ssh_host}:{remote_path}']
    print(f"Upload: {os.path.basename(local_path)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        err = result.stderr.decode() if result.stderr else 'unknown'
        print(f"Error: {err}")
        return False
    return True

# All files to deploy
all_files = [
    # Core components - upload to ~/gaozhong directly
    (r"src\hooks\useScrollHide.ts", "~/gaozhong/src/hooks/useScrollHide.ts"),
    (r"src\components\layout\Header.tsx", "~/gaozhong/src/components/layout/Header.tsx"),
    (r"src\components\layout\Sidebar.tsx", "~/gaozhong/src/components/layout/Sidebar.tsx"),
    (r"src\components\layout\MainLayout.tsx", "~/gaozhong/src/components/layout/MainLayout.tsx"),
    # Pages - need special handling for (main) folder
]

# Upload core files
for local_rel, remote_path in all_files:
    local_path = os.path.join(base_path, local_rel)
    if os.path.exists(local_path):
        scp_to_server(local_path, remote_path)
    else:
        print(f"Not found: {local_path}")

# Pages - use separate scp commands with escaped paths
page_files = [
    r"src\app\(main)\learn\page.tsx",
    r"src\app\(main)\learn\geography\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\geography\practice\[chapterId]\page.tsx",
    r"src\app\(main)\learn\geography\knowledge-full\[chapterId]\page.tsx",
    r"src\app\(main)\learn\math\function\page.tsx",
    r"src\app\(main)\learn\math\visualize\[conceptId]\page.tsx",
    r"src\app\(main)\learn\history\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\politics\knowledge\[chapterId]\page.tsx",
    r"src\app\(main)\learn\textbook\[subjectId]\[chapterId]\[sectionId]\page.tsx",
    r"src\app\(main)\learn\chinese\poetry\page.tsx",
    r"src\app\(main)\learn\chinese\poetry\[poemId]\page.tsx",
    r"src\app\(main)\learn\chinese\language\page.tsx",
    r"src\app\(main)\learn\math\geogebra\model\[modelId]\page.tsx",
    r"src\app\(main)\learn\math\function\practice\page.tsx",
]

for local_rel in page_files:
    local_path = os.path.join(base_path, local_rel)
    if os.path.exists(local_path):
        # Upload to tmp first
        tmp_path = "/tmp/page_upload.tsx"
        scp_to_server(local_path, tmp_path)
        
        # Extract the remote path
        # e.g. src\app\(main)\learn\page.tsx -> ~/gaozhong/src/app/(main)/learn/page.tsx
        remote = local_rel.replace('src\\app\\(main)\\', '~/gaozhong/src/app/(main)/')
        remote = remote.replace('\\', '/')
        remote = remote.replace('[', '[').replace(']', ']')
        
        # Copy via ssh
        ssh_cmd = ['ssh', '-i', ssh_key, f'{ssh_user}@{ssh_host}', f'cp {tmp_path} "{remote}"']
        print(f"Copy: {remote}")
        subprocess.run(ssh_cmd, capture_output=True)
    else:
        print(f"Not found: {local_path}")

print("Done!")
