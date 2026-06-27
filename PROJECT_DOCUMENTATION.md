# 高中自学平台 (Edumind) - 项目说明文档

> 本文件供其他 AI 快速理解项目结构、技术栈、页面路由、API 接口、状态管理及已知问题，以便给出针对性建议。

---

## 1. 项目概览

- **项目名称**: MyK12teacher / Edumind
- **定位**: AI 驱动的高中自学平台
- **技术栈**:
  - 框架: Next.js 14.2.15 (App Router)
  - 语言: TypeScript
  - 样式: Tailwind CSS 3.4.1
  - 状态管理: Zustand 5.0.14
  - UI 组件: Radix UI 原生封装
  - AI 集成:
    - SDK: `ai` 3.4.33, `@ai-sdk/openai` 0.0.66
    - 主模型: DeepSeek API (primary)
    - 备选: Qwen API、OpenAI API
  - 数据库:
    - 当前: localStorage（客户端）
    - 计划: Supabase (`@supabase/ssr` 0.5.2, `@supabase/supabase-js` 2.108.2)

- **构建命令**:
  - 开发: `next dev`
  - 构建: `next build`
  - 启动: `next start`
  - 检查: `next lint`

- **关键目录**:
  - `src/app/` — 页面与路由
  - `src/components/` — 共享 UI 组件
  - `src/hooks/` — 自定义 Hooks
  - `src/lib/` — 工具函数、API 调用、数据生成逻辑
  - `src/stores/` — Zustand 全局状态
  - `src/types/` — TypeScript 类型定义
  - `public/` — 静态资源

---

## 2. 页面与路由

### 2.1 主要路由结构

| 路径 | 说明 |
|------|------|
| `/` | 首页仪表盘：学科卡片、每日积累、错题统计、专注计时 |
| `/subjects/[subjectId]` | 学科中心：教材管理、章节列表、学习功能入口 |
| `/learn` | 学习模块总入口 |
| `/learn/knowledge/[subjectId]/[chapterId]/[sectionId]` | 知识点学习页 |
| `/learn/textbook/[subjectId]/[chapterId]/[sectionId]` | 教材讲解页 |
| `/learn/practice/[subjectId]/[chapterId]/[sectionId]` | 练习页 |
| `/practice` | 综合练习页 |
| `/wrong-questions` | 错题本 |
| `/words` | 英语单词学习 |
| `/settings` | 设置页 |
| `/connect` | 串联学习 |
| `/analysis` | 薄弱分析 |
| `/history` | 学习记录 |
| `/clear-pdf` | 清空 PDF 缓存 |

### 2.2 学科子路由

**数学 (Math)**
- `/learn/math/geogebra` — GeoGebra 3D 交互学习（基础模式 + AI 模式）
- `/learn/math/geogebra/model/[modelId]` — 具体模型交互页
- `/learn/math/visualize/[conceptId]` — 数学概念可视化

**英语 (English)**
- `/learn/english/textbook/[unitId]` — 教材单元
- `/learn/english/grammar` — 语法学习
- `/learn/english/reading` — 阅读理解
- `/learn/english/writing` — 写作训练
- `/learn/english/listening` — 听力训练
- `/learn/english/practice` — 英语练习

**语文 (Chinese)**
- `/learn/chinese/poetry/[poemId]` — 诗词学习
- `/learn/chinese/classical/[poemId]` — 古文学习
- `/learn/chinese/language` — 语言基础
- `/learn/chinese/reading/[chapterId]` — 阅读理解

**历史 (History)**
- `/learn/history/knowledge/[chapterId]` — 历史知识
- `/learn/history/timeline/[chapterId]` — 时间轴
- `/learn/history/causal-chain` — 因果链分析
- `/learn/history/cards` — 历史卡片记忆
- `/learn/history/textbook/[chapterId]` — 历史教材
- `/learn/history/analysis/[id]` — 史料分析
- `/learn/history/practice` — 历史练习

**地理 (Geography)**
- `/learn/geography/knowledge/[chapterId]` — 地理知识
- `/learn/geography/map` — 地图学习
- `/learn/geography/compare` — 区域对比
- `/learn/geography/cards` — 地理卡片
- `/learn/geography/location` — 地理位置分析
- `/learn/geography/practice` — 地理练习
- `/learn/geography/textbook/[chapterId]` — 地理教材

### 2.3 演示/特殊页面

- `/demo/geometry` — 原 AI+3D 交互式解题演示页，现已重定向到 `/learn/math/geogebra?mode=ai`

---

## 3. API 接口

### 3.1 核心 AI 接口

#### `POST /api/chat`
- **用途**: 通用 AI 对话（DeepSeek）
- **请求体**: `{ messages?: Array<{role, content}>, systemPrompt?: string, apiKey: string }`
- **响应**: `{ content: string }`
- **副作用**: 调用 DeepSeek Chat Completions API

#### `POST /api/ai/vision`
- **用途**: 图像理解（Qwen-VL），用于 GeoGebra 图片识别
- **请求**: FormData，包含图片文件
- **响应**: `{ success, data?: { shapeType, conditions, question, message } }`

### 3.2 PDF 与教材接口

#### `POST /api/parse-pdf`
- **用途**: 解析上传的 PDF 文件提取文本
- **请求**: FormData，`file` 字段
- **响应**: `{ fileName, totalPages, pages: [{pageNumber, content}], fullText }`
- **限制**: 最大 50MB，仅支持文本型 PDF（不支持扫描件）

#### `POST /api/textbook/upload`
- **用途**: 上传教材 PDF
- **请求**: FormData
- **响应**: 教材元数据

#### `POST /api/textbook/explain-section`
- **用途**: AI 讲解教材章节
- **请求**: `{ sectionId, content, apiKey }`
- **响应**: 讲解文本

#### `POST /api/textbook/extract-sections`
- **用途**: 自动拆分 PDF 为章节
- **请求**: PDF 内容
- **响应**: 章节列表

#### `POST /api/textbook/check-answer`
- **用途**: 检查教材习题答案
- **请求**: `{ question, userAnswer, apiKey }`
- **响应**: 是否正确及解析

### 3.3 知识点与练习生成

#### `POST /api/generate-knowledge`
- **用途**: 从 PDF 文本提取知识点
- **请求**: `{ content, chapterTitle, apiKey }`
- **响应**: `{ knowledgePoints: [{id, name, type, description}], count }`
- **注意**: 内容截断至 15000 字符，自动去除习题部分

#### `POST /api/generate-practice`
- **用途**: 为章节生成练习题
- **请求**: `{ subjectId, chapterId, sectionId, difficulty, pdfContext?, questionCount?, apiKey? }`
- **响应**: `{ questions: [{id, type, difficulty, knowledgePoint, question, options, correctAnswer, explanation, steps}] }`
- **支持学科**: 数学、物理、化学、语文、英语（各有专用 Prompt）

#### `POST /api/generate-question`
- **用途**: 单题生成（通用）
- **请求**: `{ knowledgePoint, difficulty, subject, apiKey }`
- **响应**: 题目对象

#### `POST /api/check-answer`
- **用途**: 通用答案检查
- **请求**: `{ question, userAnswer, correctAnswer, apiKey }`
- **响应**: 判分结果与解析

### 3.4 学科专用接口

**历史 (History)**
- `GET/POST /api/history/timeline/[chapterId]` — 获取/生成历史事件时间轴
- `POST /api/history/analysis/generate` — 生成史料分析题
- `GET /api/history/analysis/list` — 获取分析题列表
- `POST /api/history/analysis/submit` — 提交分析答案
- `POST /api/history/causal-chain` — 生成因果链
- `POST /api/history/cards` — 生成历史记忆卡片
- `POST /api/history/knowledge/extract` — 提取历史知识点
- `POST /api/history/knowledge/question` — 生成历史问答题

**地理 (Geography)**
- `POST /api/geography/knowledge` — 生成地理知识点
- `POST /api/geography/practice` — 生成地理练习题
- `POST /api/geography/compare` — 区域对比分析
- `POST /api/geography/location` — 地理位置分析
- `GET /api/geography/map-data` — 地图数据

**语文 (Chinese)**
- `POST /api/analyze-poetry` — 诗词分析
- `POST /api/chinese/language/generate` — 语言练习生成
- `POST /api/chinese/language/submit` — 语言练习提交
- `POST /api/chinese/reading/mindmap` — 生成阅读思维导图
- `POST /api/chinese/reading/word-explain` — 词语解释
- `POST /api/chinese/reading/dialogue` — 对话式阅读引导
- `POST /api/chinese/reading/writing-feedback` — 写作反馈

**英语 (English)**
- `POST /api/english/textbook/explain` — 教材讲解

**政治 (Politics)**
- `POST /api/politics/discrimination` — 辨析题生成
- `POST /api/politics/essay` — 材料分析题
- `POST /api/politics/knowledge` — 知识点提取
- `POST /api/politics/synthesis` — 综合题生成
- `POST /api/politics/current-affairs` — 时政热点

### 3.5 学习数据接口

- `GET/POST /api/progress` — 学习进度记录（内存 + localStorage 回退）
- `GET /api/wrong-questions/stats` — 错题统计
- `POST /api/daily-accumulation` — 每日学习积累
- `POST /api/analyze-weak-point` — 薄弱点分析
- `POST /api/visualize-concept` — 概念可视化
- `POST /api/connect-concept` — 概念关联

### 3.6 工具接口

- `POST /api/extract-chapters` — 提取章节
- `POST /api/extract-classical-words` — 提取文言文字词
- `POST /api/translate-classical` — 古文翻译
- `POST /api/extract-knowledge` — 通用知识点提取
- `POST /api/explain-knowledge` — 知识点讲解
- `POST /api/generate-questions` — 批量生成题目
- `POST /api/generate-recitation-questions` — 背诵题生成
- `POST /api/guide-wrong-question` — 错题引导
- `POST /api/similar-question` — 相似题推荐
- `POST /api/recognize-math` — 数学公式识别
- `POST /api/graph/build` — 知识图谱构建
- `GET /api/debug/storage` — 存储调试

### 3.7 GeoGebra 相关

- `POST /api/geogebra/recognize` — 几何图形识别
- `POST /api/geogebra/guide` — 几何引导讲解

### 3.8 单词管理

- `POST /api/words/import` — 导入单词
- `GET /api/words/export` — 导出单词
- `POST /api/words/reset` — 重置单词

### 3.9 其他

- `POST /api/clear-pdf` — 清空 PDF 缓存
- `GET /api/analysis/stats` — 分析统计数据

---

## 4. 共享组件

### 4.1 布局组件

| 组件 | 路径 | 用途 |
|------|------|------|
| `Sidebar` | `src/components/layout/Sidebar.tsx` | 侧边栏导航，学科切换，学习记录入口 |
| `Header` | `src/components/layout/Header.tsx` | 顶部导航栏 |
| `MainLayout` | `src/components/layout/MainLayout.tsx` | 侧边栏 + 头部 组合布局 |

### 4.2 UI 基础组件

- `Button` — 多变体按钮
- `Card` — 卡片容器（Card, CardContent, CardHeader, CardTitle）
- `Dialog` — 模态对话框
- `Input` / `Textarea` — 表单输入
- `Select` — 下拉选择
- `Tabs` — 标签页切换
- `Badge` — 标签/徽章
- `Progress` — 进度条
- `RadioGroup` — 单选组
- `Switch` — 开关切换
- `Separator` — 分割线
- `Label` — 表单标签
- `Popover` — 弹出容器
- `ScrollArea` — 自定义滚动区域
- `Avatar` — 用户头像
- `Slider` — 滑块输入
- `FocusTimer` — 专注计时器

### 4.3 学科专用组件

**练习相关**
- `PracticeQuestion` — 题目展示与选项
- `PracticeResult` — 练习结果汇总
- `SimilarQuestion` — 相似题推荐
- `ImageUploader` — 图片上传
- `GuideDialog` — 练习引导对话框

**学习通用**
- `KnowledgeList` / `KnowledgeCard` — 知识点列表与卡片
- `LearningProgress` — 学习进度展示
- `QuizQuestion` — 测验题目组件
- `Timer` — 学习计时

**PDF / 教材**
- `PDFUploader` — PDF 上传与解析
- `ChapterTree` — 章节树形导航
- `TextbookManager` — 教材管理
- `TextbookUploadDialog` — 教材上传对话框
- `TextbookViewer` — 教材内容展示

**历史 (History)**
- `TimelineChart` — 交互式时间轴
- `TimelineControlBar` — 时间轴控制条
- `CausalChain` — 因果关系可视化
- `HistoryCard` — 历史记忆卡片
- `HistoryGuide` — 学习引导提示
- `HistoryLearningPath` — 多步学习路径
- `HistoryProgressBar` — 进度指示器
- `EventDetailCard` — 历史事件详情
- `MaterialAnalysis` — 史料分析
- `AnalysisProgress` — 分析进度跟踪

**地理 (Geography)**
- `LocationAnalysis` — 位置因素分析
- `RegionCompare` — 区域对比工具
- `InteractiveMap` — 交互式地图

**语文 (Chinese)**
- `ReadingStep1` 至 `ReadingStep5` — 分步阅读引导
- `LanguagePractice` — 语言练习组件
- `WordPopup` — 词语解释弹窗

**GeoGebra / 数学可视化**
- `GeogebraContainer` — GeoGebra 集成包装器
- `ControlPanel` — GeoGebra 控制面板
- `ModelSelector` — 模型选择器
- `GeometryUpload` — 几何内容上传
- `GuideExplainer` — 引导讲解组件
- `GeoGebraViewer` — GeoGebra 显示组件

**英语 (English)**
- `EnglishLearningPath` — 六步英语学习路径

**单词 (Words)**
- `WordCard` — 单词闪卡
- `PracticeCard` — 单词练习卡

**可视化 (Visualization)**
- `ConceptGraph` — 概念图谱可视化
- `AnalogyCard` — 概念类比展示
- `GuidedThinking` — 分步思维引导
- `KnowledgeGraph` — 知识关联图谱

---

## 5. Hooks 与工具库

### 5.1 自定义 Hooks

| Hook | 路径 | 用途 |
|------|------|------|
| `useTextbooks` | `src/hooks/useTextbooks.ts` | 管理教材加载、切换、删除 |
| `useEnglishProgress` | `src/hooks/useEnglishProgress.ts` | 追踪英语学习进度 |
| `useHistoryProgress` | `src/hooks/useHistoryProgress.ts` | 追踪历史学习进度 |
| `useAnalysis` | `src/hooks/useAnalysis.ts` | 分析状态管理 |
| `useDataSync` | `src/hooks/useDataSync.ts` | 本地与云端数据同步 |
| `useTutorial` | `src/hooks/useTutorial.ts` | 引导/教程状态管理 |

### 5.2 全局状态 (Zustand Stores)

| Store | 持久化 | 内容 |
|-------|--------|------|
| `settingsStore` | 是 (`edumind-settings`) | API Keys、模型偏好、UI 设置 |
| `subjectStore` | 否 | 当前选中学科 ID |
| `historyStore` | 否 | 学习记录缓存、统计 |
| `learningStore` | — | 学习状态管理 |
| `gradeStore` | — | 年级设置 |
| `pdfStore` | — | PDF 数据存储 |

### 5.3 工具库

| 模块 | 路径 | 用途 |
|------|------|------|
| `storage` | `src/lib/storage.ts` | 带版本迁移的 localStorage 封装 |
| `dataSync` | `src/lib/dataSync.ts` | 数据同步层（本地优先，云端计划中） |
| `pdfUtils` | `src/lib/pdfUtils.ts` | PDF 文本处理工具 |
| `utils` | `src/lib/utils.ts` | 通用工具（`cn`、类名合并） |
| `validations` | `src/lib/validations.ts` | Zod 表单校验 Schema |
| `serverStorage` | `src/lib/serverStorage.ts` | 服务端数据缓存（内存） |
| `localFallback` | `src/lib/localFallback.ts` | 服务端不可用时的 localStorage 回退 |
| `knowledgeScope` | `src/lib/knowledgeScope.ts` | 知识点范围和 Prompt 格式化 |
| `questionUtils` | `src/lib/questionUtils.ts` | 题目生成工具 |
| `gradeAdapter` | `src/lib/gradeAdapter.ts` | 年级内容适配器 |

### 5.4 学科进度状态机

| 模块 | 用途 |
|------|------|
| `historyProgress` | 历史学习状态机 |
| `englishProgress` | 英语六步学习路径 |
| `geographyProgress` | 地理七步学习路径 |
| `chineseReadingProgress` | 中文阅读状态追踪 |
| `chineseLanguageProgress` | 中文语言学习状态 |

---

## 6. 核心数据模型

### 6.1 通用模型

```typescript
interface Settings {
  deepseekKey: string;
  qwenKey: string;
  apiProvider: 'deepseek' | 'qwen' | 'openai';
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Textbook {
  id: string;
  name: string;
  grade: string;
  fileName: string;
  totalPages: number;
  uploadedAt: string;
  isActive: boolean;
  chaptersCount: number;
}

interface Chapter {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
}

interface LearningRecord {
  id: string;
  subjectId: string;
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
  mode: 'KNOWLEDGE' | 'TEXTBOOK';
  duration: number;
  progress: {
    currentIndex: number;
    total: number;
    completed: number;
    knowledgePoints: KnowledgePoint[];
    masteredList: string[];
    wrongList: string[];
    answers: AnswerRecord[];
  };
  timestamp: string;
  date: string;
}

interface WrongQuestion {
  id: string;
  subjectId: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  analysis: string;
  difficulty: '简单' | '中等' | '困难';
  knowledgePoint: string;
  weakPoint: string;
  isMastered: boolean;
  wrongReason: string;
  stepAnalysis: string;
  solutionSteps: string;
  createdAt: string;
}
```

### 6.2 历史学科模型

```typescript
interface HistoryEvent {
  id: string;
  chapterId: string;
  title: string;
  year: number;
  yearEnd: number;
  dynasty: string;
  location: string;
  figures: string[];
  causes: string;
  effects: string;
  significance: string;
  summary: string;
  relatedIds: string[];
}

interface CausalChain {
  eventName: string;
  chapterId: string;
  farCauses: CausalChainNode[];
  nearCauses: CausalChainNode[];
  event: string;
  directEffects: CausalChainNode[];
  deepEffects: CausalChainNode[];
}

interface HistoryCard {
  id: string;
  type: 'event' | 'person' | 'system' | 'treaty';
  title: string;
  front: string;
  back: string;
  chapterId: string;
}

interface AnalysisSource {
  id: string;
  title: string;
  material: string;
  source: string;
  questions: AnalysisQuestion[];
  difficulty: '简单' | '中等' | '困难';
  chapterId: string;
}
```

### 6.3 地理学科模型

```typescript
interface GeographyKnowledgeItem {
  id: string;
  type: 'concept' | 'law' | 'process' | 'region';
  title: string;
  definition: string;
  elements: string[];
  analogy: string;
  liaoningExample: string;
  chapterId: string;
}
```

### 6.4 GeoGebra / 数学可视化模型

```typescript
interface GeometryData {
  type: string;
  points?: Array<{ x: number; y: number; z?: number }>;
  faces?: Array<{ vertices: number[] }>;
  // 其他几何属性
}

interface TutorialStep {
  question: string;
  hint: string;
  expectedAnswer?: string;
}
```

---

## 7. 第三方集成

### 7.1 AI 服务

| 服务 | 用途 | 配置位置 |
|------|------|----------|
| DeepSeek API | 主 AI 模型，用于题目生成、讲解、分析等 | 环境变量 / 用户设置中配置 API Key |
| Qwen API (通义千问) | 备选模型，主要用于图像理解（Qwen-VL） | 环境变量 / 用户设置 |
| OpenAI API | 计划中的备选 | 环境变量 |

### 7.2 外部库

| 库 | 用途 |
|------|------|
| `pdf-parse` | PDF 文本提取 |
| `pdfjs-dist` | 客户端 PDF 渲染 |
| `echarts` + `echarts-for-react` | 图表可视化（历史时间轴等） |
| `katex` | 数学公式渲染 |
| `react-signature-canvas` | 手写输入板（数学作答） |
| `uuid` | 唯一 ID 生成 |
| `date-fns` | 日期格式化 |
| `lucide-react` | 图标库 |
| `GeoGebra` | 嵌入式 3D 几何渲染（iframe 方式） |

### 7.3 计划中的集成

- **Supabase**: 云端数据库、认证、实时同步（代码已存在，尚未完全启用）
- **GeoGebra**: 更深入的 3D 几何交互

---

## 8. 认证与授权

- **当前状态**: 无认证机制
- **说明**: 单用户本地应用，所有数据存储在 localStorage
- **计划**: Supabase Auth 代码已存在但未激活

---

## 9. 已知问题与 TODO

### 9.1 代码层面

1. **ESLint 配置**: `next.config.mjs` 中设置了 `ignoreDuringBuilds: true`，存在未清理的 lint 问题
2. **进度计算占位**: 部分页面使用 `Math.random()` 作为进度占位（如 SubjectPage）
3. **章节状态**: 章节完成状态计算为占位逻辑，始终返回 `not_started`
4. **GeoGebra 集成**: 相关文件存在但功能完整性待验证
5. **路径重复**: Windows 路径分隔符导致部分路由文件出现重复条目

### 9.2 功能层面

- 无云端同步（localStorage 单点存储）
- 无用户系统（单用户模式）
- 部分学科模块功能深度不一
- API Key 管理依赖 localStorage，安全性有限

---

## 10. 重要配置文件

### 10.1 `package.json`

```json
{
  "scripts": ["dev", "build", "start", "lint"],
  "keyDependencies": [
    "next 14.2.15",
    "react 18",
    "zustand 5.0.14",
    "ai 3.4.33",
    "tailwindcss 3.4.1",
    "supabase",
    "echarts",
    "katex",
    "pdf-parse"
  ]
}
```

### 10.2 `tsconfig.json`

- 路径别名: `@/*` → `./src/*`
- `strict: true`
- `jsx: preserve`

### 10.3 `next.config.mjs`

- `eslint.ignoreDuringBuilds: true`（建议后续清理）

### 10.4 `tailwind.config.ts`

- 内容扫描: `./src/pages/**`, `./src/components/**`, `./src/app/**`
- 自定义颜色: `background`, `foreground`

### 10.5 环境变量模式

- DeepSeek API Key
- Qwen API Key
- OpenAI API Key（备选）
- 其他 AI 相关配置

---

## 11. 给其他 AI 的建议重点

1. **路由结构复杂**: 采用 Next.js App Router，大量动态路由 `[param]`，注意文件夹命名中的括号转义问题
2. **AI 调用分散**: 大量 API Route 分散在 `src/app/api/` 下，各学科有独立的 Prompt 和逻辑分支
3. **状态管理混合**: Zustand Store + localStorage + API 接口三层并存，注意数据一致性
4. **学科差异大**: 各学科（历史/地理/语文/英语/数学）有独立的进度状态机和 UI 组件，修改时需注意隔离
5. **GeoGebra 整合**: 当前 `/learn/math/geogebra` 已整合基础模式和 AI 模式，路由 `/demo/geometry` 已重定向至此
6. **PDF 处理**: 支持上传教材 PDF 并自动拆分章节，注意 50MB 大小限制和扫描件不支持
7. **Supabase 就绪**: 数据库 Schema 和客户端代码已准备，但未启用，如需上线需完成接入
8. **移动端适配**: 部分页面使用 `lg:grid-cols-12` 等响应式类，但复杂组件（如 GeoGebra、时间轴）在小屏体验待优化

---

*文档生成时间: 2026-06-26*
*项目路径: E:\高中自学*
