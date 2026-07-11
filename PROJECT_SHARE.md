# EduMind 高中自学系统 - 项目说明文档

## 1. 项目概览

**项目名称**: EduMind (MyK12teacher)
**项目类型**: Next.js 14 全栈 Web 应用
**核心目标**: AI 驱动的高中自学辅助平台，覆盖 9 个学科
**访问地址**: https://myk12teacher.vercel.app

---

## 2. 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript 5 |
| UI | React 18 + Tailwind CSS + Shadcn/ui |
| 状态管理 | Zustand (localStorage 持久化) |
| 数据库 | Supabase (PostgreSQL) + 本地文件系统 |
| AI 模型 | DeepSeek-V3 (对话/生成) + Qwen-VL (视觉识别) |
| 部署 | Vercel |
| TTS | 阿里云 / 讯飞 / 浏览器原生 |

---

## 3. 支持学科

```
语文 📖 | 英语 🔤 | 数学 📐 | 物理 ⚛️ | 化学 🧪
生物 🧬 | 地理 🌍 | 政治 📜 | 历史 🏛️
```

---

## 4. 核心功能模块

### 4.1 通用学习流程
```
上传PDF教材 → AI提取章节 → 选择学习模式 → AI生成内容/题目 → 练习巩固
                                                          ↓
                                                    错题自动收录
```

### 4.2 学科特色功能

**历史** 🏛️
- 时间轴（辽宁高考历史时间轴，内置40+核心事件）
- 因果链分析
- 材料分析训练
- 历史卡牌（间隔记忆）
- 知识图谱

**英语** 🔤
- 课本精读 → 单词记忆 → 语法体系 → 阅读理解 → 写作训练 → 真题实战
- 单词学习（艾宾浩斯复习算法，SM-2）
- 听力训练（开发中）

**地理** 🌍
- 交互地图
- 区域对比分析
- 区位分析
- 地理卡牌
- 综合训练

**数学** 📐
- GeoGebra 可视化
- 手写公式识别批改（Qwen-VL）
- 知识点可视化

**语文** 📖
- 诗歌鉴赏
- 文言文精讲
- 阅读理解
- 语言运用

### 4.3 其他功能
- **错题本**: 错题自动收录，AI分析薄弱点
- **单词本**: 每日单词、拼写练习、掌握度追踪
- **计时器**: 专注学习计时（按年级自动调整时长）
- **每日积累**: 各学科小知识推送
- **数据分析**: 学习进度可视化

---

## 5. 数据库结构 (Supabase)

### 5.1 核心表

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `textbooks` | PDF教材元数据 | subject_id, name, grade, file_name, total_pages |
| `textbook_chapters` | 教材章节 | textbook_id, chapter_index, chapter_title, pages |
| `textbook_cache` | 教材全文缓存 | subject_id, chapter_id, data(JSONB) |
| `wrong_questions` | 错题本 | user_id, subject_id, question, correct_answer, analysis, difficulty, knowledge_point |
| `word_mastery` | 单词掌握度 | user_id, word_id, word_text, mastery_level(0-5), review_count, next_review_date |
| `learning_progress` | 学习进度 | user_id, subject_id, chapter_id, step, status, data |
| `learning_records` | 学习时长 | user_id, subject_id, duration, date |
| `learning_sessions` | 学习会话 | user_id, mode, start_time, end_time |
| `user_settings` | 用户设置 | user_id, settings(JSONB) |

### 5.2 字段说明
- `user_id`: 当前固定为 `'personal-user'`（单用户设计）
- `knowledge_point`: 知识点标签
- `difficulty`: 难度等级
- `mastery_level`: 单词掌握度 0-5 级，对应复习间隔 [1,3,7,15,30] 天

---

## 6. API 路由结构

### 6.1 AI 核心接口

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/chat` | POST | DeepSeek 通用对话 |
| `/api/generate-question` | POST | 知识点单题生成（含未学内容检测，最多3次重试） |
| `/api/generate-questions` | POST | 整章练习题生成 |
| `/api/check-answer` | POST | AI 智能判分 |
| `/api/recognize-math` | POST | Qwen-VL 手写数学识别+批改 |
| `/api/ai/vision` | POST | Qwen-VL-Max 几何图像识别 |
| `/api/explain-knowledge` | POST | 知识点讲解 |
| `/api/similar-question` | POST | 类似题生成 |
| `/api/enrich-wrong-question` | POST | 错题深度分析 |

### 6.2 教材管理

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/textbook/upload` | POST | 上传PDF教材 |
| `/api/textbook/chapters` | GET/POST | 获取/提取章节 |
| `/api/textbook/explain-section` | POST | 章节内容讲解 |
| `/api/extract-chapters` | POST | AI章节提取（数学/历史/通用三种模式） |

### 6.3 学科专用

**历史**: `/api/history/{timeline,knowledge/extract,causal-chain,cards,analysis,progress}`
**语文**: `/api/chinese/{classical-explanation,reading,language}`
**英语**: `/api/english/textbook/explain`
**地理**: `/api/geography/{practice,compare,location,knowledge,map-data}`
**政治**: `/api/politics/{knowledge,essay,discrimination,synthesis}`

### 6.4 学习数据

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/words/{list,daily,mastery,stats}` | GET | 单词管理 |
| `/api/wrong-questions` | GET/POST | 错题管理 |
| `/api/wrong-questions/stats` | GET | 错题统计 |
| `/api/learning/{start,end,stats}` | POST | 学习时长记录 |

### 6.5 TTS 语音

`/api/tts/{synthesize,test,iflytek,aliyun}`

---

## 7. 前端页面路由

```
/                           首页
/settings                   设置页（API Keys、TTS配置）
/words                      单词学习
/wrong-questions            错题集
/textbook                    教材管理

/subjects/[subjectId]       学科入口（9个学科）
  ├── /subjects/math
  ├── /subjects/english
  ├── /subjects/history
  └── ...

/learn/[subject]/*          学习路径
  ├── /learn/english        英语6步闭环
  ├── /learn/history/timeline/ln-gaokao  历史时间轴
  ├── /learn/geography      地理7步闭环
  └── /learn/math/geogebra  GeoGebra可视化
```

---

## 8. 数据存储策略

### 8.1 三层存储
1. **Supabase**: 云端持久化（教材、错题、单词、学习记录）
2. **服务端文件**: `.data/server/*.json`（API路由间共享）
3. **localStorage**: 用户设置、API Keys（不上传服务器）

### 8.2 SmartStorage 抽象
- 自动选择 Supabase 或本地文件
- Supabase 不可用时降级到本地文件

---

## 9. 环境变量

```env
# AI API
DEEPSEEK_API_KEY=sk-xxx
QWEN_API_KEY=sk-xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# TTS（可选）
IFLYTEK_APP_ID=xxx
IFLYTEK_API_KEY=xxx
ALIYUN_ACCESS_KEY_ID=xxx
ALIYUN_ACCESS_KEY_SECRET=xxx
```

---

## 10. 关键设计模式

### 10.1 "未学不考"机制
生成题目时检测是否包含未学知识点，最多重试3次确保题目适配当前进度。

### 10.2 章节提取策略
- 数学：硬编码章节映射表（BANTU_MATH_B1 人教版B版必修第一册）
- 历史：专用三层结构（单元→课→子目）
- 其他：通用 DeepSeek AI 提取

### 10.3 单词复习算法
SM-2 算法 + 艾宾浩斯遗忘曲线：
```
掌握度0 → 1天后复习
掌握度1 → 3天后复习
掌握度2 → 7天后复习
掌握度3 → 15天后复习
掌握度4 → 30天后复习
掌握度5 → 已掌握
```

---

## 11. 目录结构

```
高中自学/
├── src/
│   ├── app/
│   │   ├── (main)/           主布局
│   │   │   ├── learn/        学习功能（各学科）
│   │   │   ├── subjects/     学科入口
│   │   │   └── ...
│   │   ├── api/              91个API路由
│   │   └── page.tsx          首页
│   ├── components/           85+ React组件
│   ├── lib/                  业务逻辑（40+模块）
│   ├── stores/               Zustand状态管理
│   ├── prompts/              AI提示词模板
│   └── types/                TypeScript类型
├── supabase/                 数据库配置
└── public/                   静态资源
```

---

## 12. 部署信息

- **Vercel 部署地址**: https://myk12teacher.vercel.app
- **Git 分支**: dev → 自动部署预览，main → 生产环境
- **Vercel 区域**: iad1 (美东)

---

## 13. 快速接入指南

### 添加新学科
1. 在 `src/stores/subjectStore.ts` 添加学科定义
2. 创建 `/src/app/(main)/learn/[新学科]/` 路由
3. 创建对应 API 路由 `/src/app/api/[新学科]/`

### 添加新功能
1. 前端组件放在 `src/components/[学科]/`
2. 业务逻辑放在 `src/lib/[学科]Service.ts`
3. API 路由放在 `src/app/api/[功能名]/route.ts`
4. 页面放在对应路由下

### 数据库变更
1. 修改 `supabase/` 下的 SQL 文件
2. 在 Supabase SQL Editor 执行
3. 更新 `src/lib/supabase.ts` 中的类型定义
