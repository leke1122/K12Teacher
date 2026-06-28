/**
 * TXT 目录文件解析器
 * 用于解析用户上传的教材目录文件，提取教材名称、单元和章节信息
 */

export interface Chapter {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  type: 'unit' | 'lesson' | 'appendix';
  children?: Chapter[];
}

export interface TOCData {
  title: string;        // 教材名称
  subject: string;     // 学科
  chapters: Chapter[];  // 章节层级结构
}

/**
 * 解析 TXT 目录文件
 * @param file TXT 文件
 * @returns 解析后的目录数据
 */
export async function parseTxtTOC(file: File): Promise<TOCData> {
  const content = await file.text();
  return parseTxtTOCContent(content);
}

/**
 * 解析 TXT 目录内容
 * @param content TXT 文件内容
 * @returns 解析后的目录数据
 */
export function parseTxtTOCContent(content: string): TOCData {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  let title = '';
  let subject = '';
  const chapters: Chapter[] = [];
  let currentUnit: Chapter | null = null;
  let unitCount = 0;
  let lessonCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // 跳过空行
    if (!trimmed) continue;

    // 跳过页数标记行（只有数字的行）
    if (/^\d+$/.test(trimmed)) continue;

    // 解析元数据 (# 开头)
    if (trimmed.startsWith('# ')) {
      const key = trimmed.substring(2).trim();
      if (!title) {
        title = key;  // 第一行 # 作为教材名称
      } else if (!subject) {
        subject = key; // 第二行 # 作为学科
      }
      continue;
    }

    // 解析单元 (## 开头)
    if (trimmed.startsWith('## ')) {
      const parts = trimmed.substring(3).split('|');
      if (parts.length >= 1) {
        unitCount++;
        currentUnit = {
          id: `unit_${unitCount}`,
          title: parts[0].trim(),
          startPage: parts.length > 1 ? parseInt(parts[1]) || 0 : 0,
          endPage: parts.length > 2 ? parseInt(parts[2]) || 0 : 0,
          type: 'unit',
          children: []
        };
        chapters.push(currentUnit);
      }
      continue;
    }

    // 解析课/节 (无前缀)
    if (!trimmed.startsWith('#') && trimmed.includes('|')) {
      const parts = trimmed.split('|');
      if (parts.length >= 3) {
        lessonCount++;
        const lesson: Chapter = {
          id: `lesson_${unitCount}_${lessonCount}`,
          title: parts[0].trim(),
          startPage: parseInt(parts[1]) || 0,
          endPage: parseInt(parts[2]) || 0,
          type: 'lesson'
        };
        
        if (currentUnit && currentUnit.children) {
          currentUnit.children.push(lesson);
        } else {
          // 如果没有当前单元，创建虚拟单元
          if (!currentUnit) {
            unitCount++;
            currentUnit = {
              id: `unit_${unitCount}`,
              title: '默认单元',
              startPage: lesson.startPage,
              endPage: lesson.endPage,
              type: 'unit',
              children: []
            };
            chapters.push(currentUnit);
          }
          currentUnit.children?.push(lesson);
        }
      }
    }
  }

  // 如果没有学科标识，默认为 history
  if (!subject) subject = 'history';
  if (!title) title = '未知教材';

  return { title, subject, chapters };
}

/**
 * 将章节数据转换为扁平格式（用于列表显示）
 */
export function flattenChapters(chapters: Chapter[]): Chapter[] {
  const result: Chapter[] = [];
  
  for (const chapter of chapters) {
    result.push(chapter);
    if (chapter.children) {
      result.push(...flattenChapters(chapter.children));
    }
  }
  
  return result;
}

/**
 * 根据章节 ID 查找章节
 */
export function findChapterById(chapters: Chapter[], id: string): Chapter | null {
  for (const chapter of chapters) {
    if (chapter.id === id) return chapter;
    if (chapter.children) {
      const found = findChapterById(chapter.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 获取章节的页数范围描述
 */
export function getChapterPageRange(chapter: Chapter): string {
  return `第${chapter.startPage}-${chapter.endPage}页`;
}

/**
 * 验证目录数据
 */
export function validateTOCData(data: TOCData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title) {
    errors.push('缺少教材名称');
  }
  
  if (data.chapters.length === 0) {
    errors.push('缺少章节数据');
  }
  
  for (const chapter of data.chapters) {
    if (chapter.type === 'unit' && chapter.children) {
      for (const lesson of chapter.children) {
        if (lesson.startPage > lesson.endPage) {
          errors.push(`章节 "${lesson.title}" 的页数范围无效`);
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}
