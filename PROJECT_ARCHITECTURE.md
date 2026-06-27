# EduMind 高中自学系统 - 技术架构文档

> 生成日期：2026-06-26
> 项目路径：E:\高中自学
> 用途：帮助其他 AI 理解项目并参与优化开发

---

## 1. 项目概述

### 1.1 项目名称
**EduMind** - AI 驱动的高中自学辅助系统

### 1.2 核心目标
为高中生提供 AI 辅助的自学平台，支持多学科（语文、英语、数学、历史、地理、政治）的教材学习、知识点精讲、练习生成、错题分析等功能。

### 1.3 技术栈

| 类别 | 技术选型 |
|------|----------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript 5 |
| UI | React 18 + Tailwind CSS + Shadcn/ui |
| 状态管理 | Zustand |
| 数据库 | Supabase + 本地文件系统 |
| AI | DeepSeek API (DeepSeek-V3) |
| 视觉 AI | Qwen-VL (数学手写识别) |
| PDF 解析 | pdf-parse |

---

## 2. 核心数据流

### 2.1 PDF 教材学习完整流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PDF 教材学习流程                               │
└─────────────────────────────────────────────────────────────────────┘

  用户上传 PDF
       │
       ▼
  ┌─────────────┐
  │ /api/parse-pdf │  ←── 提取 PDF 文本内容
  └─────────────┘
       │
       ▼
  ┌─────────────────────┐
  │ textbookStorage     │  ←── 保存到服务端文件系统
  └─────────────────────┘
       │
       ▼
  ┌─────────────────────────┐
  │ /api/extract-chapters   │  ←── AI 识别章节结构
  │   - 数学: 硬编码章节表   │
  │   - 历史: 专用提取逻辑   │
  │   - 其他: 通用提取逻辑   │
  └─────────────────────────┘
       │
       ▼
  ┌─────────────────────┐
  │ ChapterTree 组件    │  ←── 展示章节树（支持展开）
  └─────────────────────┘
       │
       ├──→ [知识点学习]  ─── /api/history/knowledge/extract
       │                          │
       │                          ▼
       │                    AI 提取详细知识点
       │                    (8-15个/课)
       │
       ├──→ [课本还原]    ─── 按页/句逐段学习
       │
       └──→ [章节练习]    ─── /api/generate-question
                                │
                                ▼
                          AI 生成选择题
                          (遵循未学不考原则)
```

### 2.2 章节提取决策流程

```
┌─────────────────────────────────────────────────────┐
│              章节提取类型决策                        │
└─────────────────────────────────────────────────────┘

请求进入 /api/extract-chapters
       │
       ▼
┌─────────────────┐
│ subjectId ===   │── Yes ─→ buildHardcodedChapters()
│ 'math'?         │           (使用硬编码数学章节表)
└────────┬────────┘
         │ No
         ▼
┌─────────────────────┐
│ 检测历史教材特征:    │
│ - 第一单元          │
│ - 第1课             │
│ - 中外历史纲要      │
│ - 鸦片战争/辛亥...  │
└────────┬────────────┘
         │
    ┌────┴────┐
    │ 检测到? │
    └────┬────┘
         │
   Yes ─┴─ No
    │         │
    ▼         ▼
extractHistoryChapters()  extractChapters()
(历史专用提取)            (通用提取)
```

---

## 3. 关键模块详解

### 3.1 教材存储模块

#### 客户端存储 (`src/lib/textbookStorage.ts`)
```typescript
// 主要功能：
// - getTextbookPDF(id): 获取教材 PDF 数据
// - getTextbooks(subjectId): 获取学科下的教材列表
// - saveTextbook(data): 保存教材元数据
```

#### 服务端存储 (`src/lib/textbookStorage.server.ts`)
```typescript
// 主要功能：
// - getActiveTextbook(subjectId): 获取当前激活的教材
// - getTextbookPDF(id): 获取 PDF 内容
// - getTextbookChapters(id): 获取章节结构
```

#### 数据同步 (`src/lib/dataSync.ts`)
```typescript
// 主要功能：
// - dataSyncSavePDF(): 保存 PDF 到云端
// - dataSyncGetPDF(): 从云端获取 PDF
// - dataSyncSaveChapters(): 保存章节到云端
```

### 3.2 历史数据模块

#### 历史数据服务 (`src/lib/historyData.server.ts`)

```typescript
// 关键函数：

// 获取章节标题
getChapterTitle(chapterId: string): string

// 获取教材文本（按页数范围）
getChapterTextByPages(chapterId, startPage?, endPage?): string | null

// 获取单课内容（新增，用于按"课"提取知识点）
getLessonContent(lessonId: string): string | null

// 获取课标题（新增）
getLessonTitle(lessonId: string): string | null
```

### 3.3 章节提取 API

#### 文件：`src/app/api/extract-chapters/route.ts`

**核心逻辑：**

1. **数学教材检测**（优先）
   - 检测 `数学（B版）必修`
   - 使用硬编码章节表 `BANTU_MATH_B1`

2. **历史教材检测**（增强）
   ```typescript
   const isHistoryTextbook =
     text.includes('第一单元') ||
     text.includes('第1课') ||
     text.includes('中外历史纲要') ||
     text.includes('从中华文明起源到秦汉') ||
     text.includes('鸦片战争') ||
     text.includes('辛亥革命') ||
     text.includes('新民主主义革命') ||
     /第[一二三四五六七八九十百]+单元/.test(text) ||
     /第[一二三四五六七八九十百零]+课/.test(text);
   ```

3. **历史专用提取** (`extractHistoryChapters()`)
   - 专用提示词（单元→课→子目）
   - 详细的调试日志
   - 验证 sections 完整性

4. **通用提取**（兜底）
   - 适用于语文、英语、地理、政治等

**响应格式：**
```typescript
{
  chapters: Chapter[],
  legacyChapters: LegacyChapter[],
  source: 'hardcoded' | 'history' | 'extracted'
}
```

#### 历史知识点提取 API

**文件：** `src/app/api/history/knowledge/extract/route.ts`

**核心改进：**
- 优先使用 `getLessonContent()` 获取单课内容
- 提取 8-15 个详细知识点（原 4-6 个）
- 每个知识点包含完整字段

---

## 4. 数据模型

### 4.1 章节结构

```typescript
interface PageRange {
  type: 'printed' | 'file';
  start: number;
  end: number;
  fileStart?: number;
  fileEnd?: number;
}

interface SubSection {
  title: string;
  pages: PageRange;
}

interface Section {
  sectionIndex: string;      // 如 "第1课"、"1.1"
  sectionTitle: string;
  pages: PageRange;
  subSections?: SubSection[];
}

interface Chapter {
  chapterIndex: number;
  chapterTitle: string;
  pages: PageRange;
  sections?: Section[];     // 历史: 课列表; 数学: 节列表
}
```

### 4.2 历史知识点

```typescript
interface HistoryKnowledgePoint {
  id: string;
  name: string;
  type: 'event' | 'figure' | 'system' | 'concept';
  time: string;
  location: string;
  figures: string[];
  causes: string;
  process: string;
  effects: string;
  significance: string;
  memoryTip: string;        // 记忆口诀
  relatedEvents: string[];
  source: string;          // 如 "第1课 中华文明的起源与早期国家"
}
```

---

## 5. API 路由清单

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/parse-pdf` | POST | 解析 PDF 提取文本 |
| `/api/extract-chapters` | POST | AI 提取章节结构 |
| `/api/generate-question` | POST | 生成练习题 |
| `/api/check-answer` | POST | 检查答案正确性 |
| `/api/history/knowledge/extract` | POST | 历史知识点提取 |
| `/api/history/timeline/[chapterId]` | GET/POST | 历史时间轴 |
| `/api/analyze-poetry` | POST | 诗歌分析 |
| `/api/translate-classical` | POST | 文言文翻译 |
| `/api/english/textbook/explain` | POST | 英语教材讲解 |
| `/api/recognize-math` | POST | 数学手写识别 |
| `/api/analyze-weak-point` | POST | 薄弱点分析 |
| `/api/daily-accumulation` | GET | 每日积累 |
| `/api/words/import` | POST | 单词导入 |
| `/api/textbook/upload` | POST | 教材上传 |

---

## 6. 当前问题与优化建议

### 6.1 历史教材章节提取问题

**问题描述：**
- 只提取到"单元"层级，没有"课"层级
- 知识点提取只有 5 个概要，不够详细

**已修复内容：**
1. ✅ 增强历史教材检测逻辑
2. ✅ 添加 `refresh` 参数支持强制刷新
3. ✅ 增加详细调试日志
4. ✅ 前端添加重新提取按钮
5. ✅ 历史知识点提取改为 8-15 个
6. ✅ 历史章节显示改为"单元"和"课"

**验证步骤：**
1. 删除 `.data/server/` 下的历史缓存
2. 重新上传历史教材
3. 点击"AI 提取章节"
4. 查看控制台日志确认 `source: 'history'`
5. 确认章节树显示单元和课两个层级

### 6.2 知识点提取优化建议

**建议改进：**
1. 添加知识点难度分级（基础/提高/拓展）
2. 支持知识点关联查询
3. 添加知识点收藏和笔记功能
4. 基于艾宾浩斯遗忘曲线安排复习

---

## 7. 常用修改模式

### 7.1 添加新的学科

1. 在 `src/stores/subjectStore.ts` 添加学科配置
2. 创建学科页面 `src/app/(main)/learn/[subjectId]/page.tsx`
3. 如需专用提取逻辑，在 `extract-chapters/route.ts` 添加检测
4. 如需专用知识点格式，创建专用 API 路由

### 7.2 修改章节提取逻辑

1. **数学教材** → 修改 `buildHardcodedChapters()` 或 `chapterPageMapping.ts`
2. **历史教材** → 修改 `extractHistoryChapters()` 函数
3. **其他学科** → 修改通用 `prompt` 变量

### 7.3 添加新的 API 路由

```typescript
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 处理逻辑
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 7.4 修改前端组件

组件位于 `src/components/` 目录：
- `pdf/` - PDF 和章节相关组件
- `history/` - 历史学科组件
- `chinese/` - 语文学科组件
- `english/` - 英语学科组件

---

## 8. 重要约束

1. **不影响现有功能**：修改前确认不破坏数学等其他学科
2. **数据隔离**：按 `subjectId` 隔离不同学科的数据
3. **缓存管理**：新增 `refresh` 参数支持强制刷新
4. **API Key 安全**：使用环境变量或用户配置的 Key
5. **错误处理**：所有 API 都有完善的错误捕获和返回

---

## 9. 文件结构速查

```
关键文件速查：
├── API 路由
│   ├── extract-chapters/route.ts      ← 章节提取核心
│   ├── history/knowledge/extract/     ← 历史知识点提取
│   └── parse-pdf/route.ts           ← PDF 解析
├── 数据存储
│   ├── textbookStorage.server.ts     ← 教材存储服务
│   ├── serverStorage.ts              ← 服务端存储
│   └── historyData.server.ts         ← 历史数据服务
├── 前端组件
│   ├── PDFUploader.tsx               ← PDF 上传组件
│   ├── ChapterTree.tsx               ← 章节树组件
│   └── subjects/[subjectId]/page.tsx ← 学科页面
└── 类型定义
    └── types/chapter.ts              ← 章节类型定义
```

---

## 10. 下一步优化方向

1. **知识点关联系统**：建立知识点之间的关联图谱
2. **智能错题本**：自动归类错题，分析错误类型
3. **学习数据分析**：可视化学习进度，识别薄弱点
4. **多语言支持**：扩展到其他学科的专用术语库
5. **离线模式**：支持无网络时的本地学习

---

*文档版本：1.0*
*最后更新：2026-06-26*
