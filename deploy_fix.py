import paramiko
import os

key_path = r"C:\Users\Admin\Desktop\lekey.pem"
hostname = "111.229.29.77"
username = "ubuntu"

files = [
    (r"e:\高中自学\src\components\layout\Header.tsx", "/home/ubuntu/gaozhong/src/components/layout/Header.tsx"),
    (r"e:\高中自学\src\components\layout\MainLayout.tsx", "/home/ubuntu/gaozhong/src/components/layout/MainLayout.tsx"),
    (r"e:\高中自学\src\app\(main)\learn\geography\knowledge-full\[chapterId]\page.tsx", 
     "/home/ubuntu/gaozhong/src/app/(main)/learn/geography/knowledge-full/[chapterId]/page.tsx"),
    (r"e:\高中自学\src\components\geography\GeographyGuidedLearning.tsx",
     "/home/ubuntu/gaozhong/src/components/geography/GeographyGuidedLearning.tsx"),
    (r"e:\高中自学\src\app\api\geography\guided-learning\generate-quiz\route.ts",
     "/home/ubuntu/gaozhong/src/app/api/geography/guided-learning/generate-quiz/route.ts"),
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, username=username, key_filename=key_path)
sftp = ssh.open_sftp()

for local_path, remote_path in files:
    with open(local_path, 'rb') as f:
        content = f.read()
    content = content.replace(b'\r\n', b'\n')
    with sftp.file(remote_path, 'wb') as f:
        f.write(content)
    print(f"Uploaded: {os.path.basename(local_path)}")

sftp.close()
ssh.close()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, username=username, key_filename=key_path)
stdin, stdout, stderr = ssh.exec_command("cd /home/ubuntu/gaozhong && rm -rf .next && pm2 restart all")
print("Restart command executed")
ssh.close()
print("Done!")
