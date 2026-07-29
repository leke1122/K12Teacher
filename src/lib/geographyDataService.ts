/**
 * 地理学科数据服务层
 * 提供地理知识、章节、练习题等数据的统一访问接口
 */

import { 
  MODULE_1_NATURAL_GEOGRAPHY, 
  MODULE_2_HUMAN_GEOGRAPHY,
  MODULE_3_REGIONAL_GEOGRAPHY,
  MODULE_4_ENVIRONMENTAL_SECURITY,
  LIAONING_SPECIAL_CONTENT,
  ANSWER_TEMPLATES,
  GLOSSARY_CATEGORIES,
  KNOWLEDGE_FRAMEWORK,
  type Module,
  type Topic,
  type KnowledgePoint,
  type LiaoningFeature,
  type AnswerTemplate,
  type GlossaryCategory
} from '@/data/geography/framework/frameworkData';

// 章节列表定义
export interface Chapter {
  id: string;
  name: string;
  module: string;
  description: string;
  topicCount: number;
  isAvailable: boolean;
}

// 章节元数据
export const CHAPTERS_META: Chapter[] = [
  {
    id: 'ch1',
    name: '第一章 宇宙中的地球',
    module: 'module-1',
    description: '天体系统、太阳系、地球的圈层结构',
    topicCount: 7,
    isAvailable: true,
  },
  {
    id: 'ch2',
    name: '第二章 地球上的大气',
    module: 'module-1',
    description: '大气组成、垂直分层、大气受热过程、热力环流',
    topicCount: 6,
    isAvailable: true,
  },
  {
    id: 'ch3',
    name: '第三章 地球上的水',
    module: 'module-1',
    description: '水循环、海陆间循环、洋流、地下水',
    topicCount: 8,
    isAvailable: true,
  },
  {
    id: 'ch4',
    name: '第四章 地貌',
    module: 'module-1',
    description: '流水地貌、风成地貌、喀斯特地貌、火山地貌',
    topicCount: 8,
    isAvailable: true,
  },
  {
    id: 'ch5',
    name: '第五章 自然地理环境的整体性与差异性',
    module: 'module-1',
    description: '自然环境整体性、地域分异规律',
    topicCount: 4,
    isAvailable: false,
  },
  {
    id: 'ch6',
    name: '第六章 自然地理野外实习',
    module: 'module-1',
    description: '自然地理野外实习方法',
    topicCount: 1,
    isAvailable: false,
  },
];

// 模块映射
const MODULE_MAP: Record<string, Module> = {
  'module-1': MODULE_1_NATURAL_GEOGRAPHY,
  'module-2': MODULE_2_HUMAN_GEOGRAPHY,
  'module-3': MODULE_3_REGIONAL_GEOGRAPHY,
  'module-4': MODULE_4_ENVIRONMENTAL_SECURITY,
};

// ===== 数据服务函数 =====

/**
 * 获取章节列表
 */
export function getChapterList(): Chapter[] {
  return CHAPTERS_META;
}

/**
 * 获取可用章节列表
 */
export function getAvailableChapters(): Chapter[] {
  return CHAPTERS_META.filter(ch => ch.isAvailable);
}

/**
 * 根据ID获取章节信息
 */
export function getChapterById(chapterId: string): Chapter | undefined {
  return CHAPTERS_META.find(ch => ch.id === chapterId);
}

/**
 * 获取模块信息
 */
export function getModuleById(moduleId: string): Module | undefined {
  return MODULE_MAP[moduleId];
}

/**
 * 获取所有模块列表
 */
export function getAllModules(): Module[] {
  return Object.values(MODULE_MAP);
}

/**
 * 根据章节ID获取对应的专题列表
 */
export function getTopicsByChapter(chapterId: string): Topic[] {
  // 第一章和第二章属于自然地理模块
  if (chapterId === 'ch1' || chapterId === 'ch2') {
    return MODULE_1_NATURAL_GEOGRAPHY.topics;
  }
  // 其他章节暂未实现
  return [];
}

/**
 * 根据专题ID获取专题详情
 */
export function getTopicById(topicId: string): Topic | undefined {
  for (const module of Object.values(MODULE_MAP)) {
    const topic = module.topics.find(t => t.id === topicId);
    if (topic) return topic;
  }
  return undefined;
}

/**
 * 根据考点ID获取考点详情
 */
export function getPointById(pointId: string): KnowledgePoint | undefined {
  for (const module of Object.values(MODULE_MAP)) {
    for (const topic of module.topics) {
      const point = topic.points.find(p => p.id === pointId);
      if (point) return point;
    }
  }
  return undefined;
}

/**
 * 搜索知识点
 */
export function searchKnowledge(keyword: string): {
  topics: Topic[];
  points: KnowledgePoint[];
} {
  const lowerKeyword = keyword.toLowerCase();
  const matchedTopics: Topic[] = [];
  const matchedPoints: KnowledgePoint[] = [];

  for (const module of Object.values(MODULE_MAP)) {
    for (const topic of module.topics) {
      // 匹配专题名称或术语
      if (
        topic.name.toLowerCase().includes(lowerKeyword) ||
        topic.terms.some(t => t.toLowerCase().includes(lowerKeyword))
      ) {
        matchedTopics.push(topic);
        matchedPoints.push(...topic.points);
      } else {
        // 匹配考点
        for (const point of topic.points) {
          if (
            point.name.toLowerCase().includes(lowerKeyword) ||
            point.concept.toLowerCase().includes(lowerKeyword) ||
            point.terms.some(t => t.toLowerCase().includes(lowerKeyword))
          ) {
            matchedPoints.push(point);
            if (!matchedTopics.includes(topic)) {
              matchedTopics.push(topic);
            }
          }
        }
      }
    }
  }

  return { topics: matchedTopics, points: matchedPoints };
}

/**
 * 获取辽宁特色内容
 */
export function getLiaoningSpecialContent(): LiaoningFeature[] {
  return LIAONING_SPECIAL_CONTENT;
}

/**
 * 获取答题模板
 */
export function getAnswerTemplates(): AnswerTemplate[] {
  return ANSWER_TEMPLATES;
}

/**
 * 获取术语表
 */
export function getGlossary(): GlossaryCategory[] {
  return GLOSSARY_CATEGORIES;
}

/**
 * 获取完整知识框架
 */
export function getKnowledgeFramework() {
  return KNOWLEDGE_FRAMEWORK;
}

/**
 * 根据专题获取关联的答题模板
 */
export function getTemplatesForTopic(topicId: string): AnswerTemplate[] {
  const topic = getTopicById(topicId);
  if (!topic?.template) return [];

  const templateId = topic.template;
  return ANSWER_TEMPLATES.filter(t => t.id === templateId);
}

/**
 * 获取专题的高频考点列表
 */
export function getHighFrequencyPoints(topicId: string): KnowledgePoint[] {
  const topic = getTopicById(topicId);
  if (!topic) return [];

  return topic.points
    .filter(p => p.frequency === 'high')
    .sort((a, b) => {
      const freqOrder = { high: 0, medium: 1, low: 2 };
      return freqOrder[a.frequency] - freqOrder[b.frequency];
    });
}

/**
 * 获取辽宁相关考点
 */
export function getLiaoningRelatedPoints(): KnowledgePoint[] {
  const points: KnowledgePoint[] = [];

  for (const module of Object.values(MODULE_MAP)) {
    for (const topic of module.topics) {
      if (topic.isLiaoningFeature) {
        points.push(...topic.points);
      }
      for (const point of topic.points) {
        if (point.isLiaoningFeature) {
          points.push(point);
        }
      }
    }
  }

  return points;
}

/**
 * 导出类型
 */
export type {
  Module,
  Topic,
  KnowledgePoint,
  LiaoningFeature,
  AnswerTemplate,
  GlossaryCategory
};
