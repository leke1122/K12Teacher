import os
import re

def update_deepseek_model(root_dir):
    """Replace deepseek-chat with deepseek-v4-flash in all TypeScript files"""
    count = 0
    files_updated = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx')):
                filepath = os.path.join(dirpath, filename)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace deepseek-chat with deepseek-v4-flash
                new_content = content.replace("deepseek-chat", "deepseek-v4-flash")
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
                    files_updated.append(filepath)
    
    return count, files_updated

if __name__ == "__main__":
    root = r"E:\高中自学\src"
    count, files = update_deepseek_model(root)
    print(f"Updated {count} files:")
    for f in files:
        print(f"  - {f}")
