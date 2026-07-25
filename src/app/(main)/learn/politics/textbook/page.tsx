'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BookOpen, Loader2, Upload, FileText, ChevronRight,
  Brain, MessageCircle, Send, Sparkles, Lightbulb, Star,
  CheckCircle2, AlertCircle, BookMarked, Menu, X, ChevronDown
} from 'lucide-react';

interface MustRememberItem {
  text: string;
  level: '核心' | '重要' | '基础';
}

interface Section {
  id: string;
  title: string;
  content: string;
  mustRemember: MustRememberItem[];
  thinkQuestion: string;
  referenceAnswer: string;
}

interface TextbookChapter {
  id: string;
  title: string;
  sections: string[];
  mustRemember: string[];
}

interface Textbook {
  id: string;
  title: string;
  units: Array<{
    id: string;
    title: string;
    sections: string[];
    mustRemember?: string[];
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 演示数据（当没有PDF内容时降级使用）
const DEMO_SECTIONS: Section[] = [
  {
    id: 'intro',
    title: '全书整体感知',
    content: '本册教材紧紧围绕中国特色社会主义这个中心，讲述中特的由来、创立、发展、完善的过程。第一课回顾从原始社会到资本主义社会的历史发展，阐释生产关系一定要适应生产力，上层建筑一定要适应经济基础的规律是本册教材内容的逻辑起点。第二课《只有社会主义才能救中国》，第三课《只有中国特色社会主义才能发展中国》，第四课《只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴》，层层递进，不断发展，是由人类社会发展的基本规律所决定的。',
    mustRemember: [
      { text: '中国特色社会主义是本册教材的核心主线', level: '核心' },
      { text: '第一课是全册教材的逻辑起点', level: '重要' },
      { text: '人类社会发展的基本规律决定了中国特色社会主义的历史必然', level: '核心' },
    ],
    thinkQuestion: '为什么说第一课是本册教材的逻辑起点？',
    referenceAnswer: '因为第一课系统回顾了从原始社会到资本主义社会的演进历程，阐释了生产关系一定要适应生产力、上层建筑一定要适应经济基础这两大人类社会发展的基本规律。这些规律是理解整个人类社会发展逻辑的基础，也是理解中国特色社会主义由来、创立、发展、完善的理论前提。',
  },
  {
    id: 'primitive',
    title: '原始社会',
    content: '原始社会是人类社会发展的最初阶段和最低阶段。生产力极其低下，石器是主要工具，人们共同劳动、共同占有生产资料，平均分配劳动产品。人与自然的矛盾是主要矛盾，氏族制度是上层建筑的核心。没有阶级、没有剥削。',
    mustRemember: [
      { text: '生产力极其低下，石器是主要工具', level: '基础' },
      { text: '生产资料氏族公有，平均分配', level: '核心' },
      { text: '主要矛盾：人与自然的矛盾', level: '重要' },
      { text: '氏族制度：无阶级、无剥削', level: '重要' },
    ],
    thinkQuestion: '原始社会没有剥削压迫，但为什么说它是人类社会发展的最低阶段？',
    referenceAnswer: '原始社会虽然没有人剥削人的现象，但生产力极其低下，人们的生活条件极为艰苦，物质极度匮乏。石器工具的使用使劳动效率极低，经常面临生存威胁。因此，虽然没有阶级压迫，但从生产力发展水平和人类整体生活水平来看，它是人类社会发展的最低阶段。',
  },
  {
    id: 'slave',
    title: '奴隶社会',
    content: '奴隶社会代替原始社会是人类社会的第一个进步。金属工具使用、城市出现、文字发明、脑力劳动与体力劳动分工。奴隶主完全占有生产资料和奴隶，奴隶毫无人身自由。国家作为阶级统治工具产生。',
    mustRemember: [
      { text: '金属工具时代，社会分工越来越细', level: '基础' },
      { text: '私有制确立——生产资料奴隶主占有', level: '核心' },
      { text: '奴隶毫无人身自由', level: '重要' },
      { text: '国家产生（阶级矛盾不可调和的产物）', level: '核心' },
      { text: '评价：历史的进步——使人类进入文明时代', level: '核心' },
    ],
    thinkQuestion: '奴隶社会代替原始社会是历史的进步，这个"进步"如何理解？',
    referenceAnswer: '这一"进步"体现在：①金属工具的广泛使用提高了劳动生产率；②城市的出现促进了商品交换和经济发展；③文字的发明使知识和经验得以保存传播；④脑力劳动与体力劳动分工推动了科学文化艺术的发展。虽然存在剥削压迫，但从人类整体文明发展的角度看，是历史的巨大进步。',
  },
  {
    id: 'feudal',
    title: '封建社会',
    content: '铁制农具推广，生产力进一步提高。地主占有绝大部分土地，农民有一定人身自由但依附于地主。地租是主要剥削方式。君主专制、等级森严是政治特征。',
    mustRemember: [
      { text: '封建土地私有制——地主剥削农民的基础', level: '核心' },
      { text: '农民有一定人身自由，有生产积极性', level: '基础' },
      { text: '地租剥削（劳役地租、实物地租、货币地租）', level: '重要' },
      { text: '君主专制、等级森严的政治特征', level: '基础' },
    ],
    thinkQuestion: '封建社会的"进步性"和"局限性"分别是什么？',
    referenceAnswer: '进步性：经济文化长期发展，创造了灿烂的古代文明（四大发明等），农业、手工业、商业都有较大发展。局限性：地主占有土地，农民受剥削压迫；周期性经济危机（农民起义频繁）；君主专制压制民主发展，社会进步缓慢。',
  },
  {
    id: 'capitalist',
    title: '资本主义社会',
    content: '工业革命带来生产力飞跃，但资本家占有生产资料，劳动者被迫出卖劳动力。生产社会化与资本主义私人占有的矛盾是基本矛盾。经济危机不可避免。',
    mustRemember: [
      { text: '工业革命：机器化、社会化大生产', level: '基础' },
      { text: '生产资料资本家私人占有', level: '核心' },
      { text: '雇佣劳动制度——资本家剥削工人', level: '核心' },
      { text: '基本矛盾：生产社会化 vs 生产资料私人占有', level: '核心' },
      { text: '经济危机：生产相对过剩', level: '重要' },
    ],
    thinkQuestion: '为什么经济危机是资本主义无法克服的痼疾？',
    referenceAnswer: '因为经济危机的根本原因是资本主义基本矛盾——生产社会化与生产资料私人占有之间的矛盾。这个矛盾在资本主义制度内无法消除，只能通过危机暂时强制性地缓解，因此经济危机会周期性爆发，成为资本主义无法克服的痼疾。',
  },
  {
    id: 'scientific',
    title: '科学社会主义的创立',
    content: '历史条件：①思想来源：空想社会主义。②历史前提：资本主义的发展和工人运动的兴起。两大理论基石：唯物史观（揭示人类社会发展一般规律）+ 剩余价值学说（揭示资本主义运行特殊规律）。诞生标志：1848年《共产党宣言》发表。',
    mustRemember: [
      { text: '思想来源：空想社会主义', level: '基础' },
      { text: '历史前提：资本主义发展 + 工人运动兴起', level: '重要' },
      { text: '唯物史观——揭示社会发展一般规律', level: '核心' },
      { text: '剩余价值学说——揭示资本主义剥削秘密', level: '核心' },
      { text: '1848年《共产党宣言》标志科学社会主义诞生', level: '核心' },
    ],
    thinkQuestion: '为什么唯物史观和剩余价值学说是科学社会主义的理论基石？',
    referenceAnswer: '唯物史观揭示了人类社会发展的一般规律（生产力与生产关系的矛盾运动），使社会主义从空想变为科学有了理论依据；剩余价值学说揭示了资本主义运行的特殊规律（资本家剥削工人的秘密），使无产阶级革命有了科学论证。两者共同回答了"为什么社会主义必然代替资本主义"这一根本问题。',
  },
];

export default function TextbookRestorePage() {
  const router = useRouter();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showThinking, setShowThinking] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('learn');
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // PDF 内容状态
  const [pdfSections, setPdfSections] = useState<Section[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  // 当前使用的章节列表（有 PDF 内容时用 pdfSections，否则用演示数据）
  const sections = pdfSections.length > 0 ? pdfSections : DEMO_SECTIONS;

  useEffect(() => {
    loadTextbooks();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 当选择的单元变化时，加载对应 PDF 内容
  useEffect(() => {
    if (!selectedUnit || !selectedTextbook) return;
    loadPdfSections(selectedTextbook.id, selectedUnit.id);
  }, [selectedUnit, selectedTextbook]);

  const loadTextbooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/politics/textbook/upload?action=list');
      const json = await res.json();
      if (json.success && json.textbooks) {
        setTextbooks(json.textbooks);
        if (json.textbooks.length > 0) {
          setSelectedTextbook(json.textbooks[0]);
          if (json.textbooks[0].units?.length > 0) {
            setSelectedUnit(json.textbooks[0].units[0]);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 根据单元ID获取章节序号（如 "politics-compulsory-1-unit1" → "1.1"）
   * 支持格式：
   * - politics-compulsory-1-unit1 → 1.1（第一课）
   * - politics-compulsory-1-unit2 → 1.2（第二课）
   */
  function getSectionIndex(unitId: string): string {
    const match = unitId.match(/unit(\d+)$/i);
    if (!match) return '1.1';
    const unitNum = parseInt(match[1], 10);
    // unit1 → 1.1, unit2 → 1.2, unit3 → 2.1, unit4 → 2.2
    if (unitNum === 1) return '1.1';
    if (unitNum === 2) return '1.2';
    if (unitNum === 3) return '2.1';
    if (unitNum === 4) return '2.2';
    if (unitNum === 5) return '2.3';
    return `${Math.ceil(unitNum / 2)}.${((unitNum - 1) % 2) + 1}`;
  }

  /**
   * 从 PDF 加载并拆分章节内容
   */
  const loadPdfSections = async (textbookId: string, unitId: string) => {
    setPdfLoading(true);
    setPdfSections([]);
    setActiveSectionIndex(0);
    try {
      // 1. 加载 PDF 内容
      const pdfRes = await fetch(`/api/textbook/pdf?textbookId=${encodeURIComponent(textbookId)}`);
      const pdfJson = await pdfRes.json();

      if (!pdfJson.success || !pdfJson.pdf?.full_text && !pdfJson.pdf?.pages?.length) {
        console.log('[Textbook] 未找到PDF内容，使用演示数据');
        setPdfLoading(false);
        return;
      }

      const fullText = pdfJson.pdf.full_text || pdfJson.pdf.fullText || '';
      const pages = pdfJson.pdf.pages || [];

      // 2. 确定页码范围（基于 politics_compulsory_1 映射）
      const sectionIndex = getSectionIndex(unitId);
      const pageRanges: Record<string, { start: number; end: number }> = {
        '1.1': { start: 28, end: 36 },
        '1.2': { start: 37, end: 44 },
        '2.1': { start: 45, end: 52 },
        '2.2': { start: 53, end: 60 },
        '2.3': { start: 61, end: 68 },
      };
      const range = pageRanges[sectionIndex] || { start: 28, end: 50 };

      // 3. 提取指定页码范围的内容
      let content = '';
      if (pages.length > 0) {
        // 优先用 pages 数组
        const filtered = pages.filter((p: any) => p.pageNumber >= range.start && p.pageNumber <= range.end);
        content = filtered.map((p: any) => p.content).join('\n\n');
      } else {
        // 回退到 full_text 手动提取
        content = extractContentByPageRangeManual(fullText, range.start, range.end);
      }

      if (!content || content.length < 50) {
        console.log('[Textbook] 提取内容为空，使用演示数据');
        setPdfLoading(false);
        return;
      }

      // 4. 拆分段落（不按字符数截断，保持原文段落完整性）
      const paragraphs = splitParagraphsSmart(content);

      // 5. 转换为 Section 格式
      const extracted: Section[] = paragraphs.map((para, idx) => {
        // 尝试从内容中提取关键知识点
        const keyPoints = extractKeyPoints(para);
        return {
          id: `pdf-${idx}`,
          title: `第 ${idx + 1} 段`,
          content: para,
          mustRemember: keyPoints.map(text => ({
            text,
            level: '核心' as const,
          })),
          thinkQuestion: generateThinkQuestion(para),
          referenceAnswer: '',
        };
      });

      if (extracted.length > 0) {
        console.log(`[Textbook] 从PDF加载 ${extracted.length} 个段落`);
        setPdfSections(extracted);
      }
    } catch (e) {
      console.error('[Textbook] 加载PDF失败:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  /**
   * 从 fullText 中手动按页码提取内容（当没有 pages 数组时）
   */
  function extractContentByPageRangeManual(fullText: string, startPage: number, endPage: number): string {
    // 尝试按页码标记提取（简单模式，避免复杂正则）
    const patterns = [
      /=====[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*=====/gu,
      /---[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*---/gu,
      /第\s*(\d+)\s*页/gu,
    ];

    for (const pattern of patterns) {
      const pages: Map<number, { start: number; end: number }> = new Map();
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(fullText)) !== null) {
        const pageNum = parseInt(match[1], 10);
        pages.set(pageNum, { start: match.index, end: 0 });
      }
      if (pages.size >= 2) {
        const sortedPages = Array.from(pages.entries()).sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < sortedPages.length; i++) {
          const [, pos] = sortedPages[i];
          if (i < sortedPages.length - 1) {
            pos.end = sortedPages[i + 1][1].start;
          } else {
            pos.end = fullText.length;
          }
        }
        let result = '';
        for (let i = startPage; i <= endPage; i++) {
          const pos = pages.get(i);
          if (pos) result += fullText.slice(pos.start, pos.end) + '\n\n';
        }
        if (result.trim().length > 100) return result.trim();
      }
    }

    // 回退：按字符数估算
    const charsPerPage = 2000;
    const startIdx = (startPage - 1) * charsPerPage;
    const endIdx = endPage * charsPerPage;
    return fullText.slice(startIdx, endIdx);
  }

  /**
   * 智能拆分段落（与 pdf-utils.ts 保持一致）
   * 原则：原文一段就一段，不按字符数截断
   */
  function splitParagraphsSmart(text: string): string[] {
    if (!text) return [];

    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 方法1：按双换行分段（PDF自然段落边界）
    let paragraphs = normalized
      .split(/\n\s*\n/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 5);

    if (paragraphs.length >= 3) return paragraphs;

    // 方法2：按单换行分段
    paragraphs = normalized
      .split(/\n/)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    if (paragraphs.length >= 3) return paragraphs;

    // 方法3：按PDF页码标记分割
    const pageSplit = normalized
      .split(/=====+\s*[第]?\s*\d+\s*[页]+\s*=+\n?/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 5);

    if (pageSplit.length >= 3) return pageSplit;

    return paragraphs.length > 0 ? paragraphs : [text.trim()];
  }

  /**
   * 从段落内容中提取关键知识点
   */
  function extractKeyPoints(para: string): string[] {
    const keyPoints: string[] = [];
    // 提取包含重要概念的短句
    const concepts = ['刺史', '酷吏', '豪强', '游侠', '币制', '铸币权', '盐铁官营', '均输平准', '董仲舒', '尊崇儒术', '郡级', '刺史', '垄断', '财产税', '抑制工商业'];
    for (const concept of concepts) {
      if (para.includes(concept) && keyPoints.length < 3) {
        // 提取包含该概念的完整短句
        const idx = para.indexOf(concept);
        const start = Math.max(0, idx - 10);
        const end = Math.min(para.length, idx + concept.length + 20);
        const snippet = para.slice(start, end).replace(/\n/g, ' ');
        if (!keyPoints.includes(snippet)) {
          keyPoints.push(snippet);
        }
      }
    }
    return keyPoints;
  }

  /**
   * 根据段落内容生成思考题
   */
  function generateThinkQuestion(para: string): string {
    // 根据内容关键词生成引导问题
    if (para.includes('刺史')) return '汉武帝在政治上采取了哪些措施来加强中央集权？';
    if (para.includes('币制') || para.includes('盐铁')) return '汉武帝在经济上是如何增加政府收入、抑制豪强势力的？';
    if (para.includes('董仲舒') || para.includes('儒术')) return '汉武帝"独尊儒术"与先秦儒学有什么不同？';
    if (para.includes('罢黜')) return '"罢黜百家，独尊儒术"有什么历史意义？';
    return '请仔细阅读上文，思考这些措施的历史意义是什么？';
  }

  const handleUpload = async (file: File) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('textbookId', selectedTextbook?.id || '');
      formData.append('textbookName', selectedTextbook?.title || file.name);

      const res = await fetch('/api/politics/textbook/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/politics/guided-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          sectionId: sections[activeSectionIndex]?.id || 'intro',
          message: currentInput,
          history: chatMessages,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: json.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我暂时无法回答，请稍后再试。' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请检查连接后重试。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentSection = sections[activeSectionIndex];
  const progress = sections.length > 0
    ? Math.round(((activeSectionIndex + 1) / sections.length) * 100)
    : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
      {/* 顶部导航 */}
      <header className="z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/subjects/politics">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-600 text-xs">
                逐段讲解
              </Badge>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setUploadModal(true)}>
                <Upload className="h-4 w-4" />
                上传教材
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 教材选择器 */}
        <Card className="border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">选择教材与单元</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> 加载中...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 教材选择 */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">教材</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    value={selectedTextbook?.id || ''}
                    onChange={(e) => {
                      const tb = textbooks.find(t => t.id === e.target.value);
                      setSelectedTextbook(tb || null);
                      if (tb?.units?.length) setSelectedUnit(tb.units[0]);
                    }}
                  >
                    {textbooks.map(tb => (
                      <option key={tb.id} value={tb.id}>{tb.title}</option>
                    ))}
                  </select>
                </div>
                {/* 单元选择 */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">单元</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    value={selectedUnit?.id || ''}
                    onChange={(e) => {
                      const unit = selectedTextbook?.units?.find(u => u.id === e.target.value);
                      setSelectedUnit(unit || null);
                      setActiveSectionIndex(0);
                      setShowThinking(false);
                      setShowAnswer(false);
                      setUserAnswer('');
                    }}
                  >
                    {selectedTextbook?.units?.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 章节导航 */}
        <Card className="border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">章节内容</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{activeSectionIndex + 1}/{sections.length}</span>
                <Progress value={progress} className="w-20 h-1.5" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => { setActiveSectionIndex(idx); setShowThinking(false); setShowAnswer(false); setUserAnswer(''); }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    idx === activeSectionIndex
                      ? 'border-amber-400 bg-amber-50 text-amber-700 font-medium'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-amber-200'
                  }`}
                >
                  {idx + 1}. {sec.title}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 学习主区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="learn" className="gap-1 text-xs">
              <BookOpen className="h-3 w-3" /> 原文
            </TabsTrigger>
            <TabsTrigger value="think" className="gap-1 text-xs">
              <Brain className="h-3 w-3" /> 思考
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 text-xs">
              <MessageCircle className="h-3 w-3" /> 问答
            </TabsTrigger>
          </TabsList>

          {/* 原文页 */}
          <TabsContent value="learn" className="space-y-4">
            <Card className="border-amber-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {currentSection?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 原文内容 */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {currentSection?.content}
                  </p>
                </div>

                {/* 必背内容 */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">📝 必背内容</span>
                  </div>
                  <div className="space-y-2">
                    {currentSection?.mustRemember?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.level === '核心' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                          item.level === '重要' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {item.level === '核心' ? '核' : item.level === '重要' ? '重' : '基'}
                        </span>
                        <p className={`text-sm ${
                          item.level === '核心' ? 'text-red-700 dark:text-red-300 font-medium' :
                          'text-slate-700 dark:text-slate-300'
                        }`}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => { setActiveTab('think'); setShowThinking(true); }}
                  >
                    <Brain className="h-4 w-4" /> 开始思考
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => {
                      if (activeSectionIndex < sections.length - 1) {
                        setActiveSectionIndex(i => i + 1);
                        setShowThinking(false);
                        setShowAnswer(false);
                        setUserAnswer('');
                      }
                    }}
                  >
                    下一段 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 思考页 */}
          <TabsContent value="think" className="space-y-4">
            <Card className="border-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-purple-700 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  引导思考
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  请先思考以下问题，写下你的答案，然后点击查看参考答案进行对比。
                </p>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">
                      Q
                    </span>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {currentSection?.thinkQuestion}
                    </p>
                  </div>

                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="写下你的思考答案..."
                    className="min-h-[100px] text-sm"
                  />

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      <Lightbulb className="h-4 w-4" />
                      {showAnswer ? '收起答案' : '查看参考答案'}
                    </Button>
                  </div>

                  {showAnswer && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">参考答案</span>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                        {currentSection?.referenceAnswer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (activeSectionIndex > 0) {
                        setActiveSectionIndex(i => i - 1);
                        setShowThinking(false);
                        setShowAnswer(false);
                        setUserAnswer('');
                      }
                    }}
                    disabled={activeSectionIndex === 0}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" /> 上一段
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={() => {
                      if (activeSectionIndex < sections.length - 1) {
                        setActiveSectionIndex(i => i + 1);
                        setShowThinking(false);
                        setShowAnswer(false);
                        setUserAnswer('');
                      }
                    }}
                    disabled={activeSectionIndex === sections.length - 1}
                  >
                    下一段 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 问答页 */}
          <TabsContent value="chat">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="text-sm font-semibold">AI 导师问答</h3>
                  <Badge variant="outline" className="text-xs ml-auto bg-blue-50">
                    当前章节：{currentSection?.title}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>你可以问我关于"{currentSection?.title}"的任何问题</p>
                      <p className="mt-1">比如："这个知识点高考怎么考？"、"能举个生活例子吗？"</p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" /> 思考中...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={`问关于"${currentSection?.title}"的问题...`}
                    className="min-h-[60px] text-sm resize-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white h-auto"
                    onClick={handleSendChat}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部导航 */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              if (activeSectionIndex > 0) {
                setActiveSectionIndex(i => i - 1);
                setShowThinking(false);
                setShowAnswer(false);
                setUserAnswer('');
              }
            }}
            disabled={activeSectionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" /> 上一段
          </Button>
          <span className="text-xs text-slate-500">
            {activeSectionIndex + 1} / {sections.length}
          </span>
          <Button
            size="sm"
            className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => {
              if (activeSectionIndex < sections.length - 1) {
                setActiveSectionIndex(i => i + 1);
                setShowThinking(false);
                setShowAnswer(false);
                setUserAnswer('');
              }
            }}
            disabled={activeSectionIndex === sections.length - 1}
          >
            下一段 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>

      {/* 上传弹窗 */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setUploadModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-500" />
                上传政治教材
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setUploadModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:border-amber-300 dark:hover:border-amber-600 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                {uploadLoading ? (
                  <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p>上传中...</p>
                  </div>
                ) : uploadSuccess ? (
                  <div className="flex flex-col items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p>上传成功！</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      点击或拖拽上传 PDF / Word 教材
                    </p>
                    <p className="text-xs text-slate-400 mt-1">支持 .pdf, .docx, .doc 格式</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  <strong>提示：</strong>上传后将自动提取教材目录结构，可选择单元和章节进行逐段学习。支持辽宁高考政治统编版教材。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
