'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowRight, ChevronRight, ChevronLeft,
  BookOpen, Brain, MessageCircle, Send, Sparkles, Lightbulb,
  CheckCircle2, XCircle, Loader2, Star, BookText, AlertCircle, Table2,
  ChevronDown, ChevronUp, RotateCcw, Zap, Target
} from 'lucide-react';

// ==================== 数据类型 ====================

interface SocialFormFullRecord {
  id: string;
  name: string;
  productivity: string;
  productionRelation: { ownership: string; distribution: string };
  laborRelation: string;
  superstructure: { politics: string; culture: string };
  mainContradiction: string;
  basicContradiction: string;
  evaluation: string;
  detail?: string;
}

interface CapitalistCrisisRecord {
  basicFeature: string;
  mainManifestations: string;
  directCauses: string[];
  rootCause: string;
}

interface GuidedSection {
  id: string;
  title: string;
  subtitle: string;
  type: 'overview' | 'social-form' | 'detail' | 'science' | 'manifesto' | 'summary';
  mustRemember: MustRememberItem[];
  thinkQAs: ThinkQAItem[];
  practiceQuestions: PracticeQuestion[];
  guidedQuestions: GuidedQuestion[];
  knowledgeLinks: string[];
  importantQuote?: string;
  // 详细原文内容
  detailContent?: {
    productivity?: string;
    ownership?: string;
    distribution?: string;
    laborRelation?: string;
    politics?: string;
    culture?: string;
    mainContradiction?: string;
    basicContradiction?: string;
    evaluation?: string;
    detail?: string;
    progress?: string[];
    limitation?: string[];
    theoreticalFoundation?: { materialistHistory: string; surplusValue: string };
    fiveProcesses?: string[];
    threeLeaps?: string[];
    whyNotEnded?: string[];
    basicFeature?: string;
    mainManifestations?: string;
    directCauses?: string[];
    rootCause?: string;
  };
}

interface MustRememberItem {
  text: string;
  level: '核心' | '重要' | '基础';
}

interface ThinkQAItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface PracticeQuestion {
  id: string;
  type: 'choice' | 'blank' | 'judge';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedSection: string;
  examPoint: string; // 考点标签
}

interface GuidedQuestion {
  id: string;
  category: string;  // 如"概念辨析"、"因果分析"、"评价类"
  question: string;
  hint: string;      // 引导提示
  stepByStep: GuidedStep[];
}

interface GuidedStep {
  step: number;
  prompt: string;    // 引导问句
  keyPoints: string[]; // 引导学生回答的关键点
  referenceAnswer: string; // 标准答案
}

interface UnitData {
  unitId: string;
  unitTitle: string;
  overview: string;
  socialFormsFull?: SocialFormFullRecord[];
  capitalistCrisis?: CapitalistCrisisRecord;
  capitalistWhyDoomed?: string[];
  utopianSocialism?: { progress: string[]; limitation: string[] };
  scientificSocialism?: {
    historicalConditions: { thoughtSource: string; historicalPremise: string };
    founding: { theoreticalFoundation: { materialistHistory: string; surplusValue: string }; birthMark: string; marxismContent: string };
    fromTheoryToPractice: string[];
    threeLeaps: string[];
    whyNotEnded: string[];
  };
  communistManifesto?: { mainContents: string[] };
}

// ==================== 练习题库（每知识点5题+按考点）====================

function generatePracticeQuestions(sectionId: string, sectionTitle: string, examPoint: string): PracticeQuestion[] {
  const baseQuestions: Record<string, PracticeQuestion[]> = {
    '原始社会': [
      { id: 'ys1', type: 'choice', question: '原始社会的生产力状况是？', options: ['机器化大生产', '金属工具为主', '石器时代，生产力极其低下', '铁器牛耕'], correctAnswer: 2, explanation: '原始社会处于石器时代，生产力极其低下，这是原始社会的基本特征。', relatedSection: '原始社会', examPoint: '生产力与生产关系' },
      { id: 'ys2', type: 'choice', question: '原始社会的生产资料所有制形式是？', options: ['私有制', '氏族公有制', '地主所有制', '资本家所有制'], correctAnswer: 1, explanation: '原始社会生产资料氏族公有，人们共同劳动、平均分配，这是原始共产主义的特点。', relatedSection: '原始社会', examPoint: '生产资料所有制' },
      { id: 'ys3', type: 'choice', question: '原始社会的主要矛盾是？', options: ['阶级矛盾', '统治阶级与被统治阶级矛盾', '人与自然的矛盾', '民族矛盾'], correctAnswer: 2, explanation: '原始社会没有阶级划分，主要矛盾是人与自然之间的矛盾，即人类生存与自然条件之间的矛盾。', relatedSection: '原始社会', examPoint: '社会主要矛盾' },
      { id: 'ys4', type: 'choice', question: '原始社会的上层建筑核心是？', options: ['国家', '法律', '氏族制度', '军队'], correctAnswer: 2, explanation: '原始社会没有国家，氏族制度是社会基础，包括氏族议事会、部落联盟等，是原始社会的上层建筑核心。', relatedSection: '原始社会', examPoint: '上层建筑' },
      { id: 'ys5', type: 'choice', question: '关于原始社会的评价，正确的是？', options: ['剥削压迫严重', '人类社会的最高阶段', '人类社会发展的最初阶段和最低阶段', '阶级分化明显'], correctAnswer: 2, explanation: '原始社会是人类社会发展的最初阶段和最低阶段，虽然没有阶级压迫，但生产力极其低下。', relatedSection: '原始社会', examPoint: '社会发展阶段' },
    ],
    '奴隶社会': [
      { id: 'ns1', type: 'choice', question: '奴隶社会代替原始社会是？', options: ['历史的倒退', '历史的进步', '没有变化', '无法判断'], correctAnswer: 1, explanation: '奴隶社会使人类进入文明时代，金属工具、文字、脑力与体力劳动分工等促进了生产力发展，这是历史的进步。', relatedSection: '奴隶社会', examPoint: '历史评价' },
      { id: 'ns2', type: 'choice', question: '奴隶社会的剥削基础是？', options: ['封建土地私有制', '生产资料私有制', '资本主义私有制', '氏族公有制'], correctAnswer: 1, explanation: '奴隶社会确立生产资料私有制，奴隶主完全占有生产资料和奴隶，这是奴隶社会剥削的基础。', relatedSection: '奴隶社会', examPoint: '剥削制度' },
      { id: 'ns3', type: 'choice', question: '国家产生的根本原因是？', options: ['阶级矛盾不可调和', '生产力的发展', '奴隶主的意愿', '战争'], correctAnswer: 1, explanation: '随着生产力发展，私有制和阶级出现，当阶级矛盾不可调和时，国家作为阶级统治工具应运而生。', relatedSection: '奴隶社会', examPoint: '国家起源' },
      { id: 'ns4', type: 'choice', question: '奴隶社会的基本矛盾是？', options: ['人与自然的矛盾', '奴隶主与奴隶的矛盾', '社会生产力同生产关系之间的矛盾', '农民与地主的矛盾'], correctAnswer: 2, explanation: '奴隶社会的基本矛盾是社会生产力同生产关系之间的矛盾，在阶级关系上表现为奴隶主与奴隶的矛盾。', relatedSection: '奴隶社会', examPoint: '社会基本矛盾' },
      { id: 'ns5', type: 'choice', question: '奴隶社会中奴隶的地位是？', options: ['有人身自由', '完全被奴隶主占有，毫无人身自由', '可以自由迁徙', '拥有生产资料'], correctAnswer: 1, explanation: '奴隶被奴隶主完全占有，视为个人财产，奴隶毫无人身自由，在奴隶主强制下劳动。', relatedSection: '奴隶社会', examPoint: '人身关系' },
    ],
    '封建社会': [
      { id: 'fj1', type: 'choice', question: '封建土地私有制是地主剥削农民的基础，因为？', options: ['农民拥有土地', '地主占有绝大部分土地，农民被迫租地耕种缴纳地租', '农民不需要交税', '土地属于国家'], correctAnswer: 1, explanation: '地主占有绝大部分土地，农民没有或只有少量土地，只能向地主租地耕种并缴纳地租，这是地主剥削农民的基础。', relatedSection: '封建社会', examPoint: '土地制度' },
      { id: 'fj2', type: 'choice', question: '封建社会农民与地主的关系是？', options: ['完全平等', '农民完全没有人身自由', '农民有一定人身自由但依附于地主', '农民是自由民'], correctAnswer: 2, explanation: '封建社会农民有一定人身自由，能够比较自主地劳动，但依附于地主，屈从于地主的奴役。', relatedSection: '封建社会', examPoint: '人身依附关系' },
      { id: 'fj3', type: 'choice', question: '封建社会的主要剥削方式是？', options: ['收取赋税', '地租剥削', '无偿劳动', '购买劳动力'], correctAnswer: 1, explanation: '地主通过地租的方式，占有农民大部分劳动成果，这是封建社会的主要剥削方式。', relatedSection: '封建社会', examPoint: '剥削方式' },
      { id: 'fj4', type: 'choice', question: '封建社会的政治特征是？', options: ['民主共和', '君主专制、等级森严', '联邦制', '奴隶主专政'], correctAnswer: 1, explanation: '封建社会实行君主专制制度，等级森严，这是封建社会政治上的基本特征。', relatedSection: '封建社会', examPoint: '政治制度' },
      { id: 'fj5', type: 'choice', question: '封建社会的主要矛盾是？', options: ['奴隶主与奴隶矛盾', '农民和地主矛盾', '资本家与工人矛盾', '人民与自然矛盾'], correctAnswer: 1, explanation: '封建社会的主要矛盾是农民和地主之间的阶级矛盾，这一矛盾推动着封建社会的发展变化。', relatedSection: '封建社会', examPoint: '社会主要矛盾' },
    ],
    '资本主义社会': [
      { id: 'zz1', type: 'choice', question: '资本主义社会的基本矛盾是？', options: ['资产阶级与无产阶级矛盾', '生产社会化与生产资料资本主义私人占有矛盾', '市场与政府矛盾', '国内与国际市场矛盾'], correctAnswer: 1, explanation: '生产社会化与生产资料资本主义私人占有之间的矛盾，是资本主义社会的基本矛盾，是一切矛盾和冲突的总根源。', relatedSection: '资本主义社会', examPoint: '基本矛盾' },
      { id: 'zz2', type: 'choice', question: '资本主义经济危机的基本特征是？', options: ['生产绝对过剩', '生产相对过剩', '生产不足', '供需平衡'], correctAnswer: 1, explanation: '经济危机的基本特征是"生产相对过剩"，即相对于劳动人民有支付能力的需求而言过剩了。', relatedSection: '资本主义社会', examPoint: '经济危机' },
      { id: 'zz3', type: 'choice', question: '资本主义经济危机的直接原因包括？', options: ['生产规模太小', '生产无限扩大趋势与有支付能力需求相对缩小矛盾', '工人工资太高', '政府干预太多'], correctAnswer: 1, explanation: '经济危机的直接原因包括：生产无限扩大趋势与劳动人民有支付能力的需求相对缩小之间的矛盾。', relatedSection: '资本主义社会', examPoint: '经济危机原因' },
      { id: 'zz4', type: 'choice', question: '资本主义必然灭亡的根本原因是？', options: ['资本家太贪婪', '资本主义基本矛盾在制度内无法消除', '社会主义太强大', '工人运动频繁'], correctAnswer: 1, explanation: '资本主义基本矛盾是生产社会化与生产资料私人占有之间的矛盾，这个矛盾在资本主义制度内无法消除，决定了资本主义的命运。', relatedSection: '资本主义社会', examPoint: '历史必然性' },
      { id: 'zz5', type: 'choice', question: '关于资本主义社会的评价，正确的是？', options: ['没有局限性', '带来生产力巨大飞跃，但经济危机无法克服', '已经完美无缺', '终将自动转变为社会主义'], correctAnswer: 1, explanation: '资本主义带来了生产力巨大飞跃和思想解放，但经济危机是其无法克服的痼疾，这是其内在局限性的体现。', relatedSection: '资本主义社会', examPoint: '历史评价' },
    ],
    '空想社会主义': [
      { id: 'kx1', type: 'choice', question: '空想社会主义的历史局限性不包括？', options: ['只有理想，没有行动路径', '看不到无产阶级力量', '已经成功实施', '没有找到正确途径'], correctAnswer: 2, explanation: '空想社会主义仅仅从理性正义出发，看不到无产阶级力量，没有找到正确途径，注定只能是空想。', relatedSection: '空想社会主义', examPoint: '局限性' },
      { id: 'kx2', type: 'choice', question: '空想社会主义的进步性体现在？', options: ['成功建立了理想社会', '揭露批判资本主义，提供理想诉求', '找到了革命道路', '得到了资本家支持'], correctAnswer: 1, explanation: '空想社会主义批判揭露资本主义，表达对未来理想社会的诉求，是科学社会主义的思想来源。', relatedSection: '空想社会主义', examPoint: '进步性' },
      { id: 'kx3', type: 'choice', question: '圣西门、傅立叶、欧文的根本错误是？', options: ['反对资本主义', '没有找到实现理想社会的正确道路和依靠力量', '太激进', '脱离实际'], correctAnswer: 1, explanation: '空想社会主义者看不到无产阶级的力量，主张阶级调和，没有找到社会变革的正确途径。', relatedSection: '空想社会主义', examPoint: '根本错误' },
      { id: 'kx4', type: 'choice', question: '空想社会主义为什么只能是空想？', options: ['目标太高', '理论不完善，行动路径和依靠力量都不对', '没有理论指导', '太保守'], correctAnswer: 1, explanation: '空想社会主义在依靠力量（看不到无产阶级）和方法（主张阶级调和）上都是错误的，注定无法实现。', relatedSection: '空想社会主义', examPoint: '空想原因' },
      { id: 'kx5', type: 'choice', question: '空想社会主义与科学社会主义的关系是？', options: ['完全对立', '科学社会主义的思想来源', '科学社会主义已经过时的部分', '没有关系'], correctAnswer: 1, explanation: '空想社会主义是科学社会主义的思想来源，马克思批判吸收其合理成分，创立了科学社会主义。', relatedSection: '空想社会主义', examPoint: '二者关系' },
    ],
    '科学社会主义': [
      { id: 'kx1', type: 'choice', question: '科学社会主义的两大理论基石是？', options: ['空想社会主义+工人运动', '唯物史观+剩余价值学说', '辩证法+认识论', '阶级斗争+无产阶级革命'], correctAnswer: 1, explanation: '唯物史观揭示人类社会发展一般规律，剩余价值学说揭示资本主义运行特殊规律，二者共同构成科学社会主义的理论基石。', relatedSection: '科学社会主义', examPoint: '理论基石' },
      { id: 'kx2', type: 'choice', question: '科学社会主义诞生的标志是？', options: ['《资本论》发表', '《德意志意识形态》发表', '《共产党宣言》发表', '巴黎公社建立'], correctAnswer: 2, explanation: '1848年《共产党宣言》发表，标志着马克思主义的诞生，标志着科学社会主义的正式诞生。', relatedSection: '科学社会主义', examPoint: '诞生标志' },
      { id: 'kx3', type: 'choice', question: '科学社会主义从空想变为科学的关键是？', options: ['工人运动兴起', '唯物史观和剩余价值学说的创立', '资产阶级软弱', '社会主义国家建立'], correctAnswer: 1, explanation: '唯物史观和剩余价值学说的创立，使社会主义从空想变为科学，实现了社会主义由空想到科学的伟大飞跃。', relatedSection: '科学社会主义', examPoint: '飞跃关键' },
      { id: 'kx4', type: 'choice', question: '社会主义从理论到现实的飞跃是指？', options: ['巴黎公社', '十月革命', '苏联解体', '中国改革开放'], correctAnswer: 1, explanation: '1917年十月革命建立了第一个社会主义国家，实现了科学社会主义从理论到现实的历史性飞跃。', relatedSection: '科学社会主义', examPoint: '理论到现实' },
      { id: 'kx5', type: 'choice', question: '为什么说社会主义不会终结？', options: ['因为社会主义国家军事强大', '因为社会主义代替资本主义不可逆转，中国特色社会主义焕发强大生命力', '因为资本主义已经崩溃', '因为工人运动已经胜利'], correctAnswer: 1, explanation: '从人类社会发展的进程和趋势看，社会主义代替资本主义是不可逆转的，中国特色社会主义在21世纪焕发出强大生命力。', relatedSection: '科学社会主义', examPoint: '历史趋势' },
    ],
  };

  return baseQuestions[sectionTitle] || [
    { id: 'gen1', type: 'choice', question: `关于"${sectionTitle}"的说法，正确的是？`, options: ['A选项', 'B选项', 'C选项', 'D选项'], correctAnswer: 1, explanation: '本题考察对基本概念的理解。', relatedSection: sectionTitle, examPoint: examPoint },
    { id: 'gen2', type: 'choice', question: `"${sectionTitle}"体现了什么规律？`, options: ['价值规律', '生产关系适应生产力规律', '竞争规律', '供求规律'], correctAnswer: 1, explanation: '本题考察对社会发展规律的理解。', relatedSection: sectionTitle, examPoint: examPoint },
    { id: 'gen3', type: 'choice', question: `在高考中，"${sectionTitle}"常以什么形式考查？`, options: ['计算题', '选择题和材料分析题', '作文题', '听力题'], correctAnswer: 1, explanation: '本题属于知识运用类题目。', relatedSection: sectionTitle, examPoint: examPoint },
    { id: 'gen4', type: 'choice', question: `学习"${sectionTitle}"对理解中国特色社会主义有什么意义？`, options: ['没有意义', '有助于理解社会主义发展规律', '增加考试负担', '浪费时间'], correctAnswer: 1, explanation: '学习社会发展规律有助于理解中国特色社会主义的历史必然性。', relatedSection: sectionTitle, examPoint: examPoint },
    { id: 'gen5', type: 'choice', question: `"${sectionTitle}"与资本主义社会的根本区别是？`, options: ['生产力水平', '生产资料所有制', '国际地位', '文化传统'], correctAnswer: 1, explanation: '生产资料所有制是区分不同社会形态的根本标志。', relatedSection: sectionTitle, examPoint: examPoint },
  ];
}

// ==================== 引导问答（每章节可选的问题）====================

function getGuidedQuestions(sectionId: string): GuidedQuestion[] {
  const questions: Record<string, GuidedQuestion[]> = {
    '原始社会': [
      { id: 'g1', category: '概念理解', question: '原始社会为什么没有阶级和剥削？', hint: '从生产力水平和生产关系特点思考', stepByStep: [{ step: 1, prompt: '原始社会的生产力水平如何？', keyPoints: ['生产力极其低下', '石器是主要工具'], referenceAnswer: '原始社会生产力极其低下，石器是主要工具，人们必须共同劳动才能生存。' }, { step: 2, prompt: '生产力低下时，生产资料归谁所有？', keyPoints: ['氏族公有', '共同劳动，平均分配'], referenceAnswer: '由于生产力低下，必须共同劳动，生产资料归氏族公有，产品平均分配。' }, { step: 3, prompt: '没有私有制和阶级分化，剥削如何产生？', keyPoints: ['剥削需要剩余产品', '需要私有制基础'], referenceAnswer: '剥削的产生需要剩余产品和私有制，原始社会生产力太低，没有剩余产品，所以没有剥削。' }] },
      { id: 'g2', category: '对比分析', question: '原始社会与奴隶社会的主要区别是什么？', hint: '从生产力、生产关系、上层建筑三个角度分析', stepByStep: [{ step: 1, prompt: '两个社会的生产力水平有什么不同？', keyPoints: ['石器 vs 金属工具', '生产效率差异'], referenceAnswer: '原始社会使用石器，奴隶社会使用金属工具，生产效率大幅提高。' }, { step: 2, prompt: '生产资料所有制有什么变化？', keyPoints: ['氏族公有 → 私有制', '剥削关系出现'], referenceAnswer: '从氏族公有制转变为奴隶主私有制，出现了人剥削人的现象。' }, { step: 3, prompt: '国家是在什么时候产生的？为什么？', keyPoints: ['阶级矛盾不可调和', '维护统治秩序'], referenceAnswer: '国家在奴隶社会产生，是阶级矛盾不可调和的产物，用于维护奴隶主的统治秩序。' }] },
    ],
    '资本主义社会': [
      { id: 'g1', category: '矛盾分析', question: '资本主义经济危机为什么无法克服？', hint: '从基本矛盾出发，分析为什么制度内无法解决', stepByStep: [{ step: 1, prompt: '资本主义社会的基本矛盾是什么？', keyPoints: ['生产社会化', '生产资料私人占有'], referenceAnswer: '生产社会化与生产资料资本主义私人占有之间的矛盾，是资本主义社会的基本矛盾。' }, { step: 2, prompt: '这个矛盾在哪些方面表现出来？', keyPoints: ['生产无限扩大 vs 需求缩小', '企业有组织 vs 社会无政府'], referenceAnswer: '表现为：①生产无限扩大趋势与劳动人民有支付能力需求相对缩小的矛盾；②个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。' }, { step: 3, prompt: '为什么说这个矛盾在制度内无法消除？', keyPoints: ['资本家追求利润', '生产资料私有制'], referenceAnswer: '资本家占有生产资料，追求利润无限扩大，而生产资料私有制无法改变，因此矛盾无法在制度内消除，只能通过危机强制缓解。' }] },
      { id: 'g2', category: '历史评价', question: '如何全面评价资本主义社会？', hint: '既看到进步性，也看到局限性', stepByStep: [{ step: 1, prompt: '资本主义社会带来了哪些进步？', keyPoints: ['生产力飞跃', '思想解放', '科学文化发展'], referenceAnswer: '带来了生产力的巨大飞跃，促进了人类思想的解放，科学、教育、文化的发展达到前所未有的高度。' }, { step: 2, prompt: '资本主义社会的根本局限是什么？', keyPoints: ['基本矛盾', '经济危机'], referenceAnswer: '经济危机是资本主义无法克服的痼疾，基本矛盾决定了一切矛盾和冲突的总根源。' }, { step: 3, prompt: '这对我们认识社会主义有什么启示？', keyPoints: ['历史必然性', '制度优势'], referenceAnswer: '启示我们：社会主义代替资本主义是历史必然，中国特色社会主义具有显著制度优势。' }] },
    ],
    '空想社会主义': [
      { id: 'g1', category: '概念辨析', question: '空想社会主义为什么是"空想"？', hint: '从理论基础、依靠力量、行动方法三个角度分析', stepByStep: [{ step: 1, prompt: '空想社会主义者看到了什么问题？', keyPoints: ['批判资本主义', '提出理想社会方案'], referenceAnswer: '他们看到了资本主义的弊端，批判资本主义，表达对未来理想社会的诉求。' }, { step: 2, prompt: '他们的理论有什么局限？', keyPoints: ['仅从理性正义出发', '没有科学理论指导'], referenceAnswer: '仅仅从理性正义的原则出发设计美好蓝图，缺乏科学理论指导和实际行动路径。' }, { step: 3, prompt: '他们在依靠力量上犯了什么错误？', keyPoints: ['主张阶级调和', '看不到无产阶级力量'], referenceAnswer: '主张阶级调和，反对阶级斗争，看不到广大人民群众特别是无产阶级的力量。' }, { step: 4, prompt: '他们在方法上有什么问题？', keyPoints: ['没有找到正确途径', '注定失败'], referenceAnswer: '没有找到进行社会变革的正确途径，注定只能是空想。' }] },
    ],
    '科学社会主义': [
      { id: 'g1', category: '因果分析', question: '科学社会主义为什么是"科学"的？', hint: '从理论基石和实践验证两个角度分析', stepByStep: [{ step: 1, prompt: '科学社会主义的理论基石是什么？', keyPoints: ['唯物史观', '剩余价值学说'], referenceAnswer: '唯物史观揭示人类社会发展一般规律，剩余价值学说揭示资本主义运行特殊规律。' }, { step: 2, prompt: '唯物史观解决了什么问题？', keyPoints: ['社会发展规律', '历史唯物主义'], referenceAnswer: '唯物史观揭示了生产力与生产关系、经济基础与上层建筑的矛盾运动规律，解决了社会发展的动力问题。' }, { step: 3, prompt: '剩余价值学说解决了什么问题？', keyPoints: ['资本主义剥削秘密', '无产阶级革命必然性'], referenceAnswer: '剩余价值学说揭示了资本家剥削工人的秘密，论证了无产阶级革命的必然性。' }, { step: 4, prompt: '为什么说这两大基石使社会主义从空想变为科学？', keyPoints: ['科学论证', '找到正确道路和力量'], referenceAnswer: '两大基石科学论证了社会主义代替资本主义的必然性，找到了实现力量（无产阶级）和正确途径（社会主义革命）。' }] },
    ],
  };

  return questions[sectionId] || [
    { id: 'gg1', category: '概念理解', question: `什么是${sectionId}？`, hint: '从定义、特点、意义三个角度理解', stepByStep: [{ step: 1, prompt: `${sectionId}的基本定义是什么？`, keyPoints: ['核心概念', '主要特征'], referenceAnswer: `${sectionId}是......（请根据具体内容回答）` }, { step: 2, prompt: `${sectionId}有什么特点？`, keyPoints: ['与其他概念的区别', '独特之处'], referenceAnswer: '主要特点包括......' }, { step: 3, prompt: `${sectionId}有什么重要意义？`, keyPoints: ['理论意义', '实践意义'], referenceAnswer: '这一概念对于理解......具有重要意义。' }] },
  ];
}

// ==================== 构建完整章节数据 ====================

function buildGuidedSections(data: UnitData): GuidedSection[] {
  const sections: GuidedSection[] = [];

  // 全书整体感知
  sections.push({
    id: 'overview',
    title: '全书整体感知',
    subtitle: '本册教材的逻辑起点与主线',
    type: 'overview',
    mustRemember: [
      { text: '中国特色社会主义是本册教材的核心主线', level: '核心' },
      { text: '第一课是全册教材的逻辑起点', level: '重要' },
      { text: '人类社会发展的基本规律：生产关系一定要适应生产力，上层建筑一定要适应经济基础', level: '核心' },
      { text: '人类社会发展的基本规律决定了中国特色社会主义的历史必然', level: '核心' },
    ],
    thinkQAs: [
      { question: '为什么说第一课是本册教材的逻辑起点？', options: ['因为第一课考试分数占比最高', '因为第一课系统阐释了两大基本规律，是理解全部内容的基础', '因为第一课介绍的历史人物最多', '因为教材按照课时安排把第一课放在最前面'], correctAnswer: 1, explanation: '第一课系统回顾了从原始社会到资本主义社会的演进历程，阐释了生产关系一定要适应生产力、上层建筑一定要适应经济基础这两大人类社会发展的基本规律。这些规律是理解整个人类社会发展逻辑的基础，也是理解中国特色社会主义由来、创立、发展、完善的理论前提。' },
      { question: '人类社会发展的基本规律指的是哪两个规律？', options: ['价值规律和竞争规律', '生产关系适应生产力的规律，上层建筑适应经济基础的规律', '剩余价值规律和资本积累规律', '按劳分配规律和等价交换规律'], correctAnswer: 1, explanation: '人类社会发展的基本规律包括：①生产关系一定要适应生产力；②上层建筑一定要适应经济基础。这两个规律决定了人类社会形态从低级向高级演进。' },
      { question: '中国特色社会主义的历史必然性是由什么决定的？', options: ['国家领导人的选择', '人类社会发展的基本规律', '经济发展的需要', '国际环境的影响'], correctAnswer: 1, explanation: '生产关系一定要适应生产力、上层建筑一定要适应经济基础的基本规律，决定了社会主义代替资本主义的历史必然性，也决定了中国特色社会主义的历史必然。' },
      { question: '第二课到第四课的内容与第一课是什么关系？', options: ['完全独立', '层层递进', '重复内容', '互不相关'], correctAnswer: 1, explanation: '第二课《只有社会主义才能救中国》、第三课《只有中国特色社会主义才能发展中国》、第四课《只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴》，与第一课的内容层层递进，不断发展。' },
      { question: '学习本册教材的核心方法是什么？', options: ['死记硬背', '理解两大基本规律，掌握核心主线', '大量刷题', '忽略理论只看案例'], correctAnswer: 1, explanation: '学习本册教材要围绕中国特色社会主义这一核心主线，理解生产关系适应生产力、上层建筑适应经济基础这两大基本规律，才能把握全书内容的内在逻辑。' },
    ],
    practiceQuestions: generatePracticeQuestions('overview', '全书整体感知', '唯物史观与基本规律'),
    guidedQuestions: [{ id: 'ov1', category: '逻辑梳理', question: '如何理解第一课是全册教材的逻辑起点？', hint: '从内容主线和规律揭示两个角度分析', stepByStep: [{ step: 1, prompt: '第一课主要讲述了什么内容？', keyPoints: ['五种社会形态', '两大基本规律'], referenceAnswer: '第一课回顾了从原始社会到资本主义社会的演进历程，阐释了生产关系一定要适应生产力、上层建筑一定要适应经济基础的基本规律。' }, { step: 2, prompt: '这些规律与后面三课的内容有什么关系？', keyPoints: ['理论依据', '逻辑基础'], referenceAnswer: '这些规律是理解整个人类社会发展逻辑的基础，也是理解第二课到第四课内容的理论前提。' }, { step: 3, prompt: '为什么说中国特色社会主义具有历史必然性？', keyPoints: ['规律决定', '历史选择'], referenceAnswer: '由人类社会发展的基本规律所决定，中国特色社会主义是科学社会主义在中国的实践和发展，具有历史必然性。' }] }],
    knowledgeLinks: ['唯物史观', '生产关系适应生产力', '上层建筑适应经济基础'],
    importantQuote: '生产关系一定要适应生产力，上层建筑一定要适应经济基础的规律。',
    detailContent: { productivity: data.overview },
  });

  // 社会形态章节
  const socialForms = data.socialFormsFull || [];
  const socialFormTitles: Record<string, string> = {
    '原始社会': '人类社会发展的最初阶段和最低阶段',
    '奴隶社会': '人类进入文明时代的门槛',
    '封建社会': '土地等级制度下的剥削社会',
    '资本主义社会': '生产社会化与私有制的基本矛盾',
    '社会主义社会': '从理论走向实践的新社会',
  };

  for (const form of socialForms) {
    sections.push({
      id: form.id,
      title: form.name,
      subtitle: socialFormTitles[form.name] || '',
      type: 'social-form',
      mustRemember: [
        { text: `生产力：${form.productivity}`, level: '基础' },
        { text: `所有制：${form.productionRelation.ownership}`, level: '核心' },
        { text: `分配：${form.productionRelation.distribution}`, level: '重要' },
        { text: `劳动关系：${form.laborRelation}`, level: '重要' },
        { text: `政治上层建筑：${form.superstructure.politics}`, level: '基础' },
        { text: `思想上层建筑：${form.superstructure.culture}`, level: '基础' },
        { text: `主要矛盾：${form.mainContradiction}`, level: '重要' },
        { text: `基本矛盾：${form.basicContradiction}`, level: '核心' },
        { text: `总体评价：${form.evaluation}`, level: '核心' },
      ],
      thinkQAs: [
        { question: `${form.name}为什么被${form.id === '奴隶社会' ? '评价为历史进步' : '称为这一社会发展阶段'}？`, options: ['因为生产力最高', '因为相比前一社会形态有进步意义', '因为没有矛盾', '因为所有人满意'], correctAnswer: 1, explanation: `${form.evaluation}` },
        { question: `${form.name}的生产资料所有制形式是什么？这与剥削有什么关系？`, options: ['公有制，没有剥削', '私有制，是剥削的基础', '没有所有制形式', '混合所有制'], correctAnswer: 1, explanation: `${form.productionRelation.ownership}生产资料私有制的确立，是${form.name}剥削现象产生的经济基础。` },
        { question: `${form.name}的主要矛盾和基本矛盾是什么？二者有什么关系？`, options: ['两个矛盾完全相同', '主要矛盾是基本矛盾的具体表现', '没有矛盾', '矛盾互不相关'], correctAnswer: 1, explanation: `${form.name}的基本矛盾是${form.basicContradiction}，主要矛盾是${form.mainContradiction}，主要矛盾是基本矛盾在阶级关系上的具体表现。` },
        { question: `从${form.name}到下一社会形态的更替说明了什么规律？`, options: ['社会倒退', '生产关系必须适应生产力发展', '上层建筑决定经济基础', '生产力决定一切'], correctAnswer: 1, explanation: '这一社会形态的更替证明了生产关系一定要适应生产力、上层建筑一定要适应经济基础的人类社会发展基本规律。' },
        { question: `${form.name}的上层建筑有什么特点？`, options: ['没有上层建筑', form.superstructure.politics.includes('国家') ? '建立了国家机器' : '氏族制度管理', form.superstructure.politics.includes('君主') ? '君主专制' : '其他'], correctAnswer: 1, explanation: `${form.superstructure.politics}，${form.superstructure.culture}。` },
      ],
      practiceQuestions: generatePracticeQuestions(form.id, form.name, form.name),
      guidedQuestions: getGuidedQuestions(form.id),
      knowledgeLinks: ['生产力', '生产关系', '上层建筑', '社会矛盾'],
      detailContent: {
        productivity: form.productivity,
        ownership: form.productionRelation.ownership,
        distribution: form.productionRelation.distribution,
        laborRelation: form.laborRelation,
        politics: form.superstructure.politics,
        culture: form.superstructure.culture,
        mainContradiction: form.mainContradiction,
        basicContradiction: form.basicContradiction,
        evaluation: form.evaluation,
        detail: form.detail,
      },
    });
  }

  // 资本主义经济危机
  if (data.capitalistCrisis) {
    sections.push({
      id: '资本主义危机',
      title: '资本主义经济危机',
      subtitle: '无法克服的痼疾',
      type: 'detail',
      mustRemember: [
        { text: `基本特征：${data.capitalistCrisis.basicFeature}`, level: '核心' },
        { text: `主要表现：${data.capitalistCrisis.mainManifestations}`, level: '重要' },
        { text: `直接原因①：${data.capitalistCrisis.directCauses[0]}`, level: '重要' },
        { text: `直接原因②：${data.capitalistCrisis.directCauses[1]}`, level: '重要' },
        { text: `直接原因③：${data.capitalistCrisis.directCauses[2]}`, level: '重要' },
        { text: `根本原因：${data.capitalistCrisis.rootCause}`, level: '核心' },
      ],
      thinkQAs: [
        { question: '资本主义经济危机的本质是什么？', options: ['生产的产品太少了', '生产相对过剩——相对于劳动人民有支付能力的需求而言过剩了', '所有商品都卖不出去', '工厂全都倒闭了'], correctAnswer: 1, explanation: '经济危机的基本特征是"生产相对过剩"，即相对于劳动人民有支付能力的需求而言，生产显得过剩了。资本家宁可把牛奶倒掉也不愿意降价卖给穷人，这正说明了生产相对过剩的本质。' },
        { question: '为什么经济危机是资本主义无法克服的痼疾？', options: ['因为资本家不愿意控制生产规模', '因为资本主义基本矛盾在制度内无法消除', '因为工人总是要求加工资', '因为市场竞争太激烈'], correctAnswer: 1, explanation: '经济危机的根本原因是资本主义基本矛盾——生产社会化与生产资料私人占有之间的矛盾。这个矛盾在资本主义制度内无法消除，只能通过危机暂时强制性地缓解，因此经济危机会周期性爆发。' },
        { question: '资本主义经济危机的直接原因包括？', options: ['生产规模太小', '生产无限扩大趋势与有支付能力需求相对缩小矛盾', '工人工资太高', '政府干预太多'], correctAnswer: 1, explanation: '经济危机的直接原因包括：①生产无限扩大的趋势与劳动人民有支付能力的需求相对缩小之间的矛盾；②个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。' },
        { question: '为什么说经济危机证明了资本主义必然灭亡？', options: ['因为危机太可怕', '因为基本矛盾无法在制度内消除', '因为工人太穷', '因为资本家太坏'], correctAnswer: 1, explanation: '经济危机证明资本主义基本矛盾在制度内无法消除，这个矛盾的发展决定了资本主义的命运——必然被社会主义所取代。' },
        { question: '如何理解"生产相对过剩"？', options: ['社会上产品太多了', '相对于有支付能力的需求显得过剩', '所有人都买不起', '生产严重不足'], correctAnswer: 1, explanation: '"生产相对过剩"不是说社会上产品真的太多了，而是相对于劳动人民有支付能力的需求而言，生产显得过剩了。这正是资本主义基本矛盾的具体体现。' },
      ],
      practiceQuestions: generatePracticeQuestions('资本主义危机', '资本主义经济危机', '经济危机与基本矛盾'),
      guidedQuestions: getGuidedQuestions('资本主义社会'),
      knowledgeLinks: ['生产相对过剩', '社会再生产', '资本主义基本矛盾', '经济危机'],
      detailContent: {
        basicFeature: data.capitalistCrisis.basicFeature,
        mainManifestations: data.capitalistCrisis.mainManifestations,
        directCauses: data.capitalistCrisis.directCauses,
        rootCause: data.capitalistCrisis.rootCause,
      },
    });
  }

  // 空想社会主义
  if (data.utopianSocialism) {
    sections.push({
      id: '空想社会主义',
      title: '空想社会主义',
      subtitle: '科学社会主义的思想来源',
      type: 'science',
      mustRemember: [
        { text: '进步性：揭露批判资本主义，是科学社会主义的思想来源', level: '重要' },
        { text: `进步性：${data.utopianSocialism.progress.join('；')}`, level: '重要' },
        { text: `局限性①：${data.utopianSocialism.limitation[0]}`, level: '核心' },
        { text: `局限性②：${data.utopianSocialism.limitation[1]}`, level: '核心' },
        { text: `局限性③：${data.utopianSocialism.limitation[2]}`, level: '核心' },
        { text: '结论：注定是空想！', level: '重要' },
      ],
      thinkQAs: [
        { question: '空想社会主义有三个局限性，分别是：', options: ['太保守、太激进、太理想化', '只有理想没有行动路径、看不到无产阶级力量、没有找到正确途径', '缺乏理论指导、缺乏群众基础、缺乏实践经验', '反对革命、反对科学、反对实践'], correctAnswer: 1, explanation: '空想社会主义的三个局限性：①仅从理性正义出发，设计美好蓝图，但行动力不强；②主张阶级调和，反对阶级斗争，看不到无产阶级的力量；③没有找到社会变革的正确途径。这三个局限性注定了空想社会主义只能是空想。' },
        { question: '为什么圣西门、傅立叶、欧文的努力最终失败了？', options: ['他们的理论太先进了', '没有找到实现理想社会的正确道路和依靠力量', '资本家太强大', '工人不支持'], correctAnswer: 1, explanation: '空想社会主义者看不到无产阶级的力量，主张阶级调和，没有找到社会变革的正确途径，注定无法实现。' },
        { question: '空想社会主义的进步性体现在哪里？', options: ['成功建立了理想社会', '揭露批判资本主义，提供理想诉求', '找到了革命道路', '得到了资本家支持'], correctAnswer: 1, explanation: '空想社会主义批判揭露资本主义，表达对未来理想社会的诉求，是科学社会主义的思想来源。' },
        { question: '空想社会主义与科学社会主义的根本区别是？', options: ['对资本主义的态度', '是否有科学理论指导和正确实践路径', '对理想社会的追求', '对工人运动的态度'], correctAnswer: 1, explanation: '科学社会主义有唯物史观和剩余价值学说作为理论基石，找到了无产阶级作为依靠力量和社会主义革命作为正确途径，而空想社会主义两者都没有。' },
        { question: '学习空想社会主义对我们有什么启示？', options: ['要批判一切', '要有科学理论指导，找到正确道路和依靠力量', '要空想未来', '要反对资本家'], correctAnswer: 1, explanation: '启示我们：做任何事情都要有科学理论指导，找到正确的道路和依靠力量，才能取得成功。' },
      ],
      practiceQuestions: generatePracticeQuestions('空想社会主义', '空想社会主义', '空想社会主义'),
      guidedQuestions: getGuidedQuestions('空想社会主义'),
      knowledgeLinks: ['圣西门', '傅立叶', '欧文', '科学社会主义'],
      detailContent: {
        progress: data.utopianSocialism.progress,
        limitation: data.utopianSocialism.limitation,
      },
    });
  }

  // 科学社会主义
  if (data.scientificSocialism) {
    const ss = data.scientificSocialism;
    sections.push({
      id: '科学社会主义',
      title: '科学社会主义的创立与实践',
      subtitle: '两大理论基石与历史进程',
      type: 'science',
      mustRemember: [
        { text: `思想来源：${ss.historicalConditions.thoughtSource}`, level: '基础' },
        { text: `历史前提：${ss.historicalConditions.historicalPremise}`, level: '重要' },
        { text: `理论基石①：唯物史观——${ss.founding.theoreticalFoundation.materialistHistory}`, level: '核心' },
        { text: `理论基石②：剩余价值学说——${ss.founding.theoreticalFoundation.surplusValue}`, level: '核心' },
        { text: `诞生标志：${ss.founding.birthMark}`, level: '核心' },
        { text: `五大过程：${ss.fromTheoryToPractice.join('；')}`, level: '重要' },
        { text: `三次飞跃：${ss.threeLeaps.join('；')}`, level: '重要' },
        { text: `不会终结：${ss.whyNotEnded.join('；')}`, level: '重要' },
      ],
      thinkQAs: [
        { question: '科学社会主义的两大理论基石是什么？', options: ['空想社会主义+工人运动', '唯物史观+剩余价值学说', '辩证法+认识论', '阶级斗争+无产阶级革命'], correctAnswer: 1, explanation: '唯物史观揭示了人类社会发展的一般规律，使社会主义从空想变为科学有了理论依据；剩余价值学说揭示了资本主义运行的特殊规律，使无产阶级革命有了科学论证。' },
        { question: '科学社会主义诞生的标志是什么？', options: ['《资本论》发表', '《德意志意识形态》发表', '《共产党宣言》发表', '巴黎公社建立'], correctAnswer: 2, explanation: '1848年《共产党宣言》的发表标志着马克思主义的诞生，标志着科学社会主义的正式诞生。' },
        { question: '社会主义从理论到现实的飞跃是指？', options: ['巴黎公社', '十月革命', '苏联解体', '中国改革开放'], correctAnswer: 1, explanation: '1917年十月革命建立了第一个社会主义国家，实现了科学社会主义从理论到现实的历史性飞跃。' },
        { question: '为什么说社会主义不会终结？', options: ['因为社会主义国家军事强大', '因为社会主义代替资本主义不可逆转，中国特色社会主义焕发强大生命力', '因为资本主义已经崩溃', '因为工人运动已经胜利'], correctAnswer: 1, explanation: '从人类社会发展的进程和趋势看，社会主义代替资本主义是不可逆转的，中国特色社会主义在21世纪焕发出强大生命力。' },
        { question: '唯物史观和剩余价值学说如何使社会主义从空想变为科学？', options: ['提供了理想目标', '科学论证了历史必然性，找到了实现力量和正确途径', '批判了资本主义', '提出了具体方案'], correctAnswer: 1, explanation: '两大理论基石科学论证了社会主义代替资本主义的必然性，找到了无产阶级作为实现力量和社会主义革命作为正确途径，使社会主义从空想变为科学。' },
      ],
      practiceQuestions: generatePracticeQuestions('科学社会主义', '科学社会主义', '科学社会主义'),
      guidedQuestions: getGuidedQuestions('科学社会主义'),
      knowledgeLinks: ['唯物史观', '剩余价值学说', '《共产党宣言》', '马克思主义'],
      importantQuote: '唯物史观揭示了人类社会发展的一般规律，剩余价值学说揭示了资本主义运行的特殊规律。',
      detailContent: {
        theoreticalFoundation: ss.founding.theoreticalFoundation,
        fiveProcesses: ss.fromTheoryToPractice,
        threeLeaps: ss.threeLeaps,
        whyNotEnded: ss.whyNotEnded,
      },
    });
  }

  // 全课总结
  sections.push({
    id: '全课总结',
    title: '全课总结',
    subtitle: '社会主义从空想到科学、从理论到实践的发展',
    type: 'summary',
    mustRemember: [
      { text: '核心规律：生产关系适应生产力', level: '核心' },
      { text: '核心矛盾：资本主义基本矛盾', level: '核心' },
      { text: '核心飞跃：空想到科学、理论到实践', level: '重要' },
      { text: '核心结论：两个必然（资本主义灭亡、社会主义胜利）', level: '核心' },
    ],
    thinkQAs: [
      { question: '用本课所学，解释为什么社会主义代替资本主义是历史必然？', options: ['因为资本家太坏了', '因为生产社会化程度越高，资本主义基本矛盾越尖锐，资本主义无法解决', '因为社会主义国家军队更强大', '因为资本主义国家人民不想活了'], correctAnswer: 1, explanation: '随着生产社会化程度不断提高，资本、生产资料、劳动产品越来越集中在少数资本家手里，资本主义基本矛盾越来越尖锐。这个矛盾在资本主义制度内无法消除，只能通过危机强制缓解，因此社会主义代替资本主义是解决这一矛盾的历史必然选择。' },
      { question: '学习本课后，你对中国特色社会主义有什么新的认识？', options: ['和中国古代社会一样', '是中国人民的历史选择，是科学社会主义在中国的实践和发展', '是资本主义的变种', '是偶然的历史现象'], correctAnswer: 1, explanation: '中国特色社会主义是中国人民的历史选择，是科学社会主义在中国的实践和发展，在21世纪焕发出强大生命力，体现了社会主义制度的优越性。' },
      { question: '资本主义基本矛盾为什么是"总根源"？', options: ['因为它是最大的矛盾', '因为它决定了资本主义社会一切矛盾和冲突', '因为它无法解决', '因为它最明显'], correctAnswer: 1, explanation: '资本主义基本矛盾是生产社会化与生产资料私人占有之间的矛盾，这个矛盾决定了无产阶级与资产阶级的对立、个别企业有组织性与整个社会生产无政府状态的对立，是资本主义社会一切矛盾和冲突的总根源。' },
      { question: '为什么说十月革命具有世界历史意义？', options: ['因为俄国很强大', '因为它实现了科学社会主义从理论到现实的历史性飞跃', '因为它推翻了沙皇', '因为它建立了联盟'], correctAnswer: 1, explanation: '十月革命建立了第一个社会主义国家，开辟了人类历史的新纪元，实现了科学社会主义从理论到现实的历史性飞跃。' },
      { question: '空想社会主义和科学社会主义的本质区别是什么？', options: ['对资本主义的批判程度不同', '是否有科学理论指导和正确实践路径', '对未来社会的设想不同', '对工人运动的态度不同'], correctAnswer: 1, explanation: '科学社会主义有唯物史观和剩余价值学说作为理论基石，找到了无产阶级作为依靠力量和社会主义革命作为正确途径，而空想社会主义两者都没有，这是本质区别。' },
    ],
    practiceQuestions: generatePracticeQuestions('全课总结', '全课总结', '综合运用'),
    guidedQuestions: [{ id: 'sum1', category: '综合运用', question: '如何用本课知识分析现实问题？', hint: '运用基本规律和核心概念分析', stepByStep: [{ step: 1, prompt: '本题涉及的核心概念是什么？', keyPoints: ['基本矛盾', '基本规律'], referenceAnswer: '首先识别题目涉及的核心概念，如资本主义基本矛盾、生产关系适应生产力规律等。' }, { step: 2, prompt: '这些概念之间的逻辑关系是什么？', keyPoints: ['矛盾推动发展', '规律决定趋势'], referenceAnswer: '运用基本规律分析概念间的逻辑关系，如资本主义基本矛盾如何导致经济危机，进而证明社会主义代替资本主义的必然性。' }, { step: 3, prompt: '如何用本课知识回答本题？', keyPoints: ['理论依据', '逻辑论证'], referenceAnswer: '结合题目要求，运用本课的核心概念和基本规律，进行逻辑严密的论证分析。' }] }],
    knowledgeLinks: ['唯物史观', '剩余价值学说', '资本主义基本矛盾', '两个必然'],
  });

  return sections;
}

// ==================== 主组件 ====================

export default function GuidedLearningPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [unitData, setUnitData] = useState<UnitData | null>(null);
  const [guidedSections, setGuidedSections] = useState<GuidedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('learn');
  const [practiceAnswer, setPracticeAnswer] = useState<Record<string, number | string>>({});
  const [practiceRevealed, setPracticeRevealed] = useState<Set<string>>(new Set());
  const [practiceCount, setPracticeCount] = useState(5);
  const [selectedGuidedQuestion, setSelectedGuidedQuestion] = useState<GuidedQuestion | null>(null);
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedInput, setGuidedInput] = useState('');
  const [guidedShowHint, setGuidedShowHint] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 加载数据
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/politics/knowledge/load?chapterId=${chapterId}`);
        const json = await res.json();
        if (json.success) {
          setUnitData(json);
          setGuidedSections(buildGuidedSections(json));
        }
      } catch (e) {
        console.error('加载失败', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [chapterId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const currentSection = guidedSections[currentIndex];
  const overallProgress = guidedSections.length > 0
    ? Math.round((completedSections.size / guidedSections.length) * 100)
    : 0;

  const handleSectionChange = (newIndex: number) => {
    setCurrentIndex(newIndex);
    setActiveTab('learn');
    setPracticeAnswer({});
    setPracticeRevealed(new Set());
    setSelectedGuidedQuestion(null);
    setGuidedStep(0);
    setGuidedInput('');
    setGuidedShowHint(false);
  };

  const handleComplete = () => {
    if (!currentSection) return;
    setCompletedSections(prev => new Set([...prev, currentSection.id]));
    if (currentIndex < guidedSections.length - 1) {
      handleSectionChange(currentIndex + 1);
    }
  };

  const handleRevealPracticeAnswer = (qId: string) => {
    setPracticeRevealed(prev => new Set([...prev, qId]));
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentSection) return;
    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    try {
      // 读取用户配置的 API Key
      const apiKey = (() => {
        try {
          const raw = localStorage.getItem('edumind-settings');
          if (!raw) return '';
          const parsed = JSON.parse(raw);
          return parsed?.state?.settings?.deepseekKey || parsed?.settings?.deepseekKey || '';
        } catch { return ''; }
      })();

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch('/api/politics/guided-learning', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'chat',
          sectionId: currentSection.id,
          message: currentInput,
          history: chatMessages,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: json.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: json.message || '抱歉，我暂时无法回答，请稍后再试。' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请检查连接后重试。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // 引导问答：选择问题
  const handleSelectGuidedQuestion = (q: GuidedQuestion) => {
    setSelectedGuidedQuestion(q);
    setGuidedStep(0);
    setGuidedInput('');
    setGuidedShowHint(false);
    setActiveTab('guided');
  };

  // 引导问答：下一步
  const handleGuidedNext = () => {
    if (!selectedGuidedQuestion) return;
    if (guidedStep < selectedGuidedQuestion.stepByStep.length - 1) {
      setGuidedStep(prev => prev + 1);
      setGuidedInput('');
    }
  };

  // 引导问答：显示参考答案
  const handleShowReference = () => {
    setGuidedShowHint(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-pink-500" />
          <p className="text-sm text-slate-500">正在加载学习内容...</p>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return <div className="text-center py-8 text-slate-500">暂无学习内容</div>;
  }

  const isCompleted = completedSections.has(currentSection.id);

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <Card className="border-pink-100">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">学习进度</span>
              {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
            <span className="text-xs text-slate-500">{completedSections.size}/{guidedSections.length} 已完成</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs bg-pink-50">
              第 {currentIndex + 1} / {guidedSections.length} 章
            </Badge>
            <Badge className="bg-pink-500 text-white text-xs">
              {currentSection.title}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 章节导航 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {guidedSections.map((s, idx) => {
          const isDone = completedSections.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => handleSectionChange(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                idx === currentIndex
                  ? 'border-pink-400 bg-pink-50 text-pink-700 shadow-sm'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-600 hover:border-pink-200'
              }`}
            >
              <div className="flex items-center gap-1">
                {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />}
                <span className="font-medium">{idx + 1}. {s.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 主内容区 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="learn" className="gap-1 text-xs"><BookOpen className="h-3 w-3" /> 学习</TabsTrigger>
          <TabsTrigger value="think" className="gap-1 text-xs"><Brain className="h-3 w-3" /> 思考</TabsTrigger>
          <TabsTrigger value="guided" className="gap-1 text-xs"><Zap className="h-3 w-3" /> 引导</TabsTrigger>
          <TabsTrigger value="chat" className="gap-1 text-xs"><MessageCircle className="h-3 w-3" /> 问答</TabsTrigger>
          <TabsTrigger value="practice" className="gap-1 text-xs"><Star className="h-3 w-3" /> 练习</TabsTrigger>
        </TabsList>

        {/* 学习页 - 详细原文 */}
        <TabsContent value="learn">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-pink-700">{currentSection.title}</CardTitle>
                {isCompleted && <Badge className="bg-emerald-100 text-emerald-700">已学习</Badge>}
              </div>
              <p className="text-sm text-slate-500">{currentSection.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 详细原文内容 */}
              {currentSection.detailContent && (() => {
                const labels: Record<string, string> = {
                  productivity: '生产力', ownership: '生产资料所有制', distribution: '个人消费品分配',
                  laborRelation: '劳动关系', politics: '政治上层建筑', culture: '思想上层建筑',
                  mainContradiction: '主要矛盾', basicContradiction: '基本矛盾', evaluation: '总体评价',
                  detail: '详细内容', basicFeature: '基本特征', mainManifestations: '主要表现',
                  directCauses: '直接原因', rootCause: '根本原因', progress: '进步性', limitation: '局限性',
                  theoreticalFoundation: '理论基石', fiveProcesses: '五大过程', threeLeaps: '三次飞跃',
                  whyNotEnded: '为什么不会终结',
                };
                return (
                  <div className="space-y-3">
                    {Object.entries(currentSection.detailContent)
                      .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
                      .map(([key, value]) => {
                        const label = labels[key] || key;
                        return (
                          <div key={key} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                              <Table2 className="h-3 w-3" /> {label}
                            </h4>
                            {Array.isArray(value) ? (
                              <ul className="space-y-1">
                                {value.map((item, i) => (
                                  <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                    <span className="text-pink-400 flex-shrink-0">·</span>
                                    <span>{String(item)}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{String(value)}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })()}
              {currentSection.detailContent?.theoreticalFoundation && (() => {
                const tf = currentSection.detailContent.theoreticalFoundation!;
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <Table2 className="h-3 w-3" /> 理论基石详解
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-pink-400 flex-shrink-0">·</span>
                        <span><strong>唯物史观：</strong>{tf.materialistHistory}</span>
                      </li>
                      <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-pink-400 flex-shrink-0">·</span>
                        <span><strong>剩余价值学说：</strong>{tf.surplusValue}</span>
                      </li>
                    </ul>
                  </div>
                );
              })()}
              {currentSection.detailContent?.directCauses && currentSection.detailContent.directCauses.length > 0 && (() => {
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <Table2 className="h-3 w-3" /> 直接原因详解
                    </h4>
                    <ul className="space-y-1">
                      {currentSection.detailContent.directCauses.map((cause, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-pink-400 flex-shrink-0">{i + 1}.</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* 重要引文 */}
              {currentSection.importantQuote && (
                <div className="bg-pink-50 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-pink-700 dark:text-pink-300 mb-2 flex items-center gap-1">
                    重要论断
                  </h3>
                  <p className="text-sm italic text-pink-800 dark:text-pink-200">"{currentSection.importantQuote}"</p>
                </div>
              )}

              {/* 必背内容 */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold text-red-700 dark:text-red-300">必背内容</span>
                  <Badge className="ml-auto bg-red-100 text-red-600 text-xs border-0">必须掌握</Badge>
                </div>
                <div className="space-y-2">
                  {currentSection.mustRemember.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.level === '核心' ? 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200' :
                        item.level === '重要' ? 'bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-200' :
                        'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {item.level === '核心' ? '核' : item.level === '重要' ? '重' : '基'}
                      </span>
                      <p className={`text-sm leading-snug ${item.level === '核心' ? 'text-red-800 dark:text-red-200 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 关联知识点 */}
              {currentSection.knowledgeLinks && currentSection.knowledgeLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500">关联概念：</span>
                  {currentSection.knowledgeLinks.map(link => (
                    <Badge key={link} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                      {link}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setActiveTab('think')}>
                  <Brain className="h-4 w-4" /> 开始思考
                </Button>
                <Button size="sm" className="gap-1 bg-pink-500 hover:bg-pink-600 text-white" onClick={handleComplete}>
                  {isCompleted ? '继续下一章' : '我学会了'} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 思考页 - 5题 */}
        <TabsContent value="think">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <h3 className="text-sm font-semibold">引导思考</h3>
                <Badge variant="outline" className="ml-auto text-xs bg-purple-50">
                  每章节 {currentSection.thinkQAs.length} 题
                </Badge>
              </div>

              <div className="space-y-4">
                {currentSection.thinkQAs.map((qa, qIdx) => {
                  const userAnswer = practiceAnswer[`think-${qIdx}`] as number | undefined;
                  const isRevealed = practiceRevealed.has(`think-${qIdx}`);

                  return (
                    <div key={qIdx} className="border border-purple-100 dark:border-purple-900 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-medium">
                          Q{qIdx + 1}
                        </span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                          {qa.question}
                        </p>
                      </div>

                      <RadioGroup
                        value={String(userAnswer ?? '')}
                        onValueChange={val => setPracticeAnswer(prev => ({ ...prev, [`think-${qIdx}`]: parseInt(val) }))}
                        className="space-y-2 ml-8"
                      >
                        {qa.options.map((opt, oIdx) => {
                          const isCorrectOption = oIdx === qa.correctAnswer;
                          return (
                            <div key={oIdx} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                              isRevealed
                                ? isCorrectOption ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' :
                                  userAnswer === oIdx ? 'border-red-300 bg-red-50 dark:bg-red-950/30' :
                                  'border-slate-200 dark:border-slate-700'
                                : 'border-slate-200 dark:border-slate-700 hover:border-purple-200'
                            }`}>
                              <RadioGroupItem value={String(oIdx)} id={`think-${qIdx}-opt-${oIdx}`} />
                              <Label htmlFor={`think-${qIdx}-opt-${oIdx}`} className="text-sm flex-1 cursor-pointer">
                                <span className="text-xs text-slate-400 mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                                {opt}
                                {isRevealed && isCorrectOption && <CheckCircle2 className="inline h-4 w-4 ml-2 text-emerald-500" />}
                                {isRevealed && userAnswer === oIdx && !isCorrectOption && <XCircle className="inline h-4 w-4 ml-2 text-red-500" />}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>

                      {!isRevealed && userAnswer !== undefined && (
                        <div className="ml-8">
                          <Button size="sm" className="gap-1 bg-purple-500 hover:bg-purple-600 text-white" onClick={() => handleRevealPracticeAnswer(`think-${qIdx}`)}>
                            <Lightbulb className="h-4 w-4" /> 查看解析
                          </Button>
                        </div>
                      )}

                      {isRevealed && (
                        <div className={`ml-8 rounded-lg p-3 ${userAnswer === qa.correctAnswer ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <span className="font-medium">解析：</span>{qa.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <Button size="sm" className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4" /> 思考完成，继续学习
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 引导问答页 */}
        <TabsContent value="guided">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="text-sm font-semibold">引导式问答</h3>
                <Badge variant="outline" className="ml-auto text-xs bg-yellow-50">
                  逐步引导，深入理解
                </Badge>
              </div>

              {!selectedGuidedQuestion ? (
                <>
                  <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    选择一个你感兴趣的问题，我会通过逐步引导的方式帮助你分析和解答。
                  </p>
                  <div className="space-y-2">
                    {currentSection.guidedQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSelectGuidedQuestion(q)}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-purple-50">{q.category}</Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{q.question}</p>
                        <p className="text-xs text-slate-500 mt-1">提示：{q.hint}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-purple-50">{selectedGuidedQuestion.category}</Badge>
                    <button onClick={() => { setSelectedGuidedQuestion(null); setGuidedStep(0); }} className="text-xs text-slate-500 hover:text-pink-500 ml-auto">返回选题</button>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                      {selectedGuidedQuestion.question}
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">提示：{selectedGuidedQuestion.hint}</p>
                  </div>

                  {/* 步骤进度 */}
                  <div className="flex items-center gap-1">
                    {selectedGuidedQuestion.stepByStep.map((step, i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full ${i <= guidedStep ? 'bg-yellow-400' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">第 {guidedStep + 1} / {selectedGuidedQuestion.stepByStep.length} 步</p>

                  {/* 当前步骤 */}
                  {selectedGuidedQuestion.stepByStep[guidedStep] && (
                    <div className="space-y-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-pink-600">引导问题：</span>
                          {selectedGuidedQuestion.stepByStep[guidedStep].prompt}
                        </p>
                      </div>

                      <Textarea
                        value={guidedInput}
                        onChange={e => setGuidedInput(e.target.value)}
                        placeholder="在这里写下你的回答..."
                        className="min-h-[80px] text-sm"
                      />

                      <div className="flex gap-2">
                        {!guidedShowHint ? (
                          <Button size="sm" variant="outline" className="gap-1" onClick={handleShowReference}>
                            <Lightbulb className="h-4 w-4" /> 查看参考答案
                          </Button>
                        ) : (
                          <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">参考答案：</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">{selectedGuidedQuestion.stepByStep[guidedStep].referenceAnswer}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {guidedStep < selectedGuidedQuestion.stepByStep.length - 1 ? (
                          <Button size="sm" className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleGuidedNext}>
                            下一题 <ArrowRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => { setSelectedGuidedQuestion(null); setGuidedStep(0); }}>
                            <CheckCircle2 className="h-4 w-4" /> 完成本题
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setGuidedShowHint(false); setGuidedInput(''); if (guidedStep > 0) setGuidedStep(prev => prev - 1); }} disabled={guidedStep === 0}>
                          <RotateCcw className="h-4 w-4" /> 重做
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                <Badge variant="outline" className="text-xs ml-auto bg-blue-50">基于当前章节</Badge>
              </div>

              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>你可以问我关于"{currentSection.title}"的任何问题</p>
                    <p className="mt-1">比如："这个知识点高考怎么考？"、"能举个生活例子吗？"</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
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
                  placeholder={`问关于"${currentSection.title}"的问题...`}
                  className="min-h-[60px] text-sm resize-none"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                />
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-auto" onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 练习页 - 可选数量 */}
        <TabsContent value="practice">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-sm font-semibold">章节练习</h3>
                  <Badge variant="outline" className="text-xs bg-yellow-50">按考点生成</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">题目数量：</span>
                  <select
                    value={practiceCount}
                    onChange={e => setPracticeCount(Number(e.target.value))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value={5}>5题</option>
                    <option value={10}>10题</option>
                    <option value={15}>15题</option>
                    <option value={20}>20题</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {currentSection.practiceQuestions.slice(0, practiceCount).map((q, qIdx) => {
                  const isRevealed = practiceRevealed.has(q.id);
                  const userAnswer = practiceAnswer[q.id];

                  return (
                    <div key={q.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 text-xs flex items-center justify-center font-medium">
                          {qIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug mb-1">
                            {q.question}
                          </p>
                          <Badge variant="outline" className="text-xs bg-purple-50">{q.examPoint}</Badge>
                        </div>
                      </div>

                      {q.options && (
                        <RadioGroup
                          value={String(userAnswer ?? '')}
                          onValueChange={val => setPracticeAnswer(prev => ({ ...prev, [q.id]: parseInt(val) }))}
                          className="space-y-2 ml-8"
                        >
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOption = oIdx === q.correctAnswer;
                            return (
                              <div key={oIdx} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                                isRevealed
                                  ? isCorrectOption ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                                  : userAnswer === oIdx ? 'border-red-300 bg-red-50 dark:bg-red-950/30'
                                  : 'border-slate-200 dark:border-slate-700'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-yellow-200'
                              }`}>
                                <RadioGroupItem value={String(oIdx)} id={`practice-${q.id}-opt-${oIdx}`} />
                                <Label htmlFor={`practice-${q.id}-opt-${oIdx}`} className="text-sm flex-1 cursor-pointer">
                                  <span className="text-xs text-slate-400 mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                                  {opt}
                                  {isRevealed && isCorrectOption && <CheckCircle2 className="inline h-4 w-4 ml-2 text-emerald-500" />}
                                  {isRevealed && userAnswer === oIdx && !isCorrectOption && <XCircle className="inline h-4 w-4 ml-2 text-red-500" />}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      )}

                      {!isRevealed && userAnswer !== undefined && (
                        <div className="ml-8">
                          <Button size="sm" className="gap-1 bg-pink-500 hover:bg-pink-600 text-white" onClick={() => handleRevealPracticeAnswer(q.id)}>
                            <Lightbulb className="h-4 w-4" /> 查看解析
                          </Button>
                        </div>
                      )}

                      {isRevealed && (
                        <div className={`ml-8 rounded-lg p-3 ${userAnswer === q.correctAnswer ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <span className="font-medium">解析：</span>{q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {currentSection.practiceQuestions.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-500">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>暂无练习题</p>
                </div>
              )}

              {practiceCount > currentSection.practiceQuestions.length && (
                <p className="text-xs text-slate-500 text-center">当前章节共 {currentSection.practiceQuestions.length} 题</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底部导航 */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleSectionChange(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" /> 上一章
        </Button>
        <span className="text-xs text-slate-500">{completedSections.size}/{guidedSections.length} 已完成</span>
        <Button size="sm" className="gap-1 bg-pink-500 hover:bg-pink-600 text-white" onClick={() => handleSectionChange(Math.min(guidedSections.length - 1, currentIndex + 1))} disabled={currentIndex === guidedSections.length - 1}>
          下一章 <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
