# -*- coding: utf-8 -*-
"""
地理学科数据导入脚本 v5 - 使用正确的 anon key
"""

import re
import json
import sys
import urllib.request
import ssl
from pathlib import Path

# 设置 UTF-8 输出
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Supabase 配置
SUPABASE_URL = 'https://hcflszvrefjpfziehvfe.supabase.co'
API_KEY = 'sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2'

# 文档路径
DOCS_PATH = Path(r"e:\workbuddy\2026-07-18-08-30-48")
OUTPUT_DIR = Path(r"E:\高中自学\src\data\geography\imported")

def make_request(method, url, data=None):
    """发送 HTTP 请求"""
    headers = {
        'apikey': API_KEY,
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

def check_table_exists():
    """检查表是否存在"""
    url = f"{SUPABASE_URL}/rest/v1/geography_knowledge?select=id&limit=1"
    status, body = make_request('GET', url)
    print(f"[检查] 表状态: {status}")
    if status == 200:
        return True
    print(f"[检查] 响应: {body[:200]}")
    return False

def clear_data():
    """清空数据"""
    url = f"{SUPABASE_URL}/rest/v1/geography_knowledge"
    status, body = make_request('DELETE', url)
    print(f"[清空] 状态: {status}")
    return status in [200, 204]

def insert_records(records):
    """批量插入"""
    url = f"{SUPABASE_URL}/rest/v1/geography_knowledge"
    data = json.dumps(records, ensure_ascii=False).encode('utf-8')
    status, body = make_request('POST', url, data)
    return status, body

def parse_exam_frequency(text):
    """解析考频"""
    stars = len(re.findall(r'⭐', text))
    if stars == 0:
        stars = len(re.findall(r'★', text))
    if stars == 0:
        stars = len(re.findall(r'\*', text))
    return min(stars, 5) if stars > 0 else 1

def parse_framework_doc(content):
    """解析框架文档"""
    print("[解析] 框架文档...")
    records = []
    
    point_pattern = r'(#{2,4})\s*(考点?\s*[\d\.]+[^\n]*)\n([\s\S]*?)(?=\n#{2,4}\s|### 📚|\n---|\n模块|\n专题|# 第一部分|$)'
    raw_points = re.findall(point_pattern, content)
    
    print(f"[解析] 考点数: {len(raw_points)}")
    
    for i, (level, title, body) in enumerate(raw_points):
        if '考点' in title and '.' in title:
            freq_match = re.search(r'考频标注[：:]\s*([^\n]+)', body)
            freq = parse_exam_frequency(freq_match.group(1) if freq_match else "")
            
            keywords = []
            for kw in ['天体', '太阳', '大气', '地球', '辐射', '运动', '气候', '温度', '气压', '水汽', '逆温', '热力', '板块', '水循环', '洋流', '地貌', '人口', '城市', '农业', '工业', '交通', '资源', '环境', '生态', '海洋']:
                if kw in body:
                    keywords.append(kw)
            
            record = {
                "chapter_id": "framework",
                "section_id": f"framework-{i+1}",
                "content_type": "framework",
                "title": title.strip()[:200],
                "content": body.strip()[:8000],
                "keywords": keywords[:10],
                "exam_frequency": freq,
                "difficulty": 3 if freq >= 4 else (2 if freq >= 2 else 1)
            }
            records.append(record)
    
    return records

def parse_chapter_doc(content, chapter_id):
    """解析章节"""
    print(f"[解析] {chapter_id}...")
    records = []
    
    subsection_pattern = r'###\s+(\d+\.\s*[^\n]+)\n([\s\S]*?)(?=###\s+\d+\.|##\s+第|$)'
    subsubsections = re.findall(subsection_pattern, content)
    
    print(f"[解析] 小节数: {len(subsubsections)}")
    
    for i, (title, body) in enumerate(subsubsections):
        freq_match = re.search(r'★{1,5}', body)
        freq = freq_match.group(0).count('★') if freq_match else 1
        
        keywords = []
        for kw in ['天体', '太阳', '大气', '地球', '辐射', '运动', '气候', '温度', '气压', '水汽', '逆温', '热力', '对流', '臭氧', '水圈', '岩石圈', '生物圈']:
            if kw in body:
                keywords.append(kw)
        
        record = {
            "chapter_id": chapter_id,
            "section_id": f"{chapter_id}-content",
            "content_type": "detail",
            "title": title.strip()[:200],
            "content": body.strip()[:8000],
            "keywords": keywords[:10],
            "exam_frequency": freq,
            "difficulty": 2
        }
        records.append(record)
    
    return records

def main():
    """主函数"""
    print("=" * 60)
    print("地理数据导入 v5")
    print("=" * 60)
    
    # 检查表
    print("\n[1] 检查表...")
    if not check_table_exists():
        print("[错误] 表不存在")
        return
    
    # 清空
    print("\n[2] 清空数据...")
    clear_data()
    
    # 解析文档
    print("\n[3] 解析文档...")
    
    all_records = []
    
    framework_path = DOCS_PATH / "高中地理_满分知识框架体系_完整版_2026辽宁专版.md"
    if framework_path.exists():
        with open(framework_path, 'r', encoding='utf-8') as f:
            content = f.read()
        recs = parse_framework_doc(content)
        all_records.extend(recs)
        print(f"  框架: {len(recs)} 条")
    
    ch1_path = DOCS_PATH / "地理必修一_第一章_宇宙中的地球_知识点完善版.md"
    if ch1_path.exists():
        with open(ch1_path, 'r', encoding='utf-8') as f:
            content = f.read()
        recs = parse_chapter_doc(content, 'ch1')
        all_records.extend(recs)
        print(f"  第一章: {len(recs)} 条")
    
    ch2_path = DOCS_PATH / "地理必修一_第二章_地球上的大气_知识点完善版.md"
    if ch2_path.exists():
        with open(ch2_path, 'r', encoding='utf-8') as f:
            content = f.read()
        recs = parse_chapter_doc(content, 'ch2')
        all_records.extend(recs)
        print(f"  第二章: {len(recs)} 条")
    
    print(f"\n[汇总] 总计: {len(all_records)} 条")
    
    # 批量导入
    print("\n[4] 导入数据...")
    batch_size = 20
    success_total = 0
    fail_total = 0
    
    for i in range(0, len(all_records), batch_size):
        batch = all_records[i:i+batch_size]
        status, body = insert_records(batch)
        
        if status in [200, 201]:
            success_total += len(batch)
            print(f"  [OK] 批次 {i//batch_size + 1}: {len(batch)} 条")
        else:
            fail_total += len(batch)
            print(f"  [FAIL] 批次 {i//batch_size + 1}: {status} - {body[:100]}")
    
    print(f"\n[结果] 成功: {success_total}, 失败: {fail_total}")
    
    # 验证
    print("\n[5] 验证...")
    status, body = make_request('GET', f"{SUPABASE_URL}/rest/v1/geography_knowledge?select=id&limit=500")
    if status == 200:
        data = json.loads(body)
        print(f"  数据库共 {len(data)} 条记录")
    
    print("\n" + "=" * 60)
    print(f"完成！共导入 {success_total} 条")
    print("=" * 60)

if __name__ == "__main__":
    main()