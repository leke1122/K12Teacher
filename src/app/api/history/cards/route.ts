import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// 内置卡牌数据（用于 Supabase 无数据时的 fallback）
const BUILT_IN_CARDS = [
  { id: 'c1', title: '元谋人', category: '文化', front: '元谋人', back: '距今约170万年，中国境内已知最早的人类。使用打制石器，以采集和渔猎为生。', difficulty: 'easy' },
  { id: 'c2', title: '北京人', category: '文化', front: '北京人', back: '距今约70-20万年，发现于北京周口店。使用天然火，增强了生存能力。', difficulty: 'easy' },
  { id: 'c3', title: '仰韶文化', category: '文化', front: '仰韶文化', back: '黄河中游新石器时代文化，以彩陶著称，种植粟类作物。', difficulty: 'medium' },
  { id: 'c4', title: '河姆渡文化', category: '文化', front: '河姆渡文化', back: '长江下游新石器时代文化，种植水稻，建干栏式建筑，养蚕缫丝。', difficulty: 'medium' },
  { id: 'c5', title: '龙山文化', category: '文化', front: '龙山文化', back: '黄河流域新石器时代晚期文化，以黑陶著称，出现父系氏族社会。', difficulty: 'medium' },
  { id: 'c6', title: '分封制', category: '政治', front: '分封制', back: '"封建亲戚，以藩屏周"。西周分封对象：王族、功臣、先代贵族。', difficulty: 'easy' },
  { id: 'c7', title: '宗法制', category: '政治', front: '宗法制', back: '核心是嫡长子继承制，解决贵族权力和财产继承问题，与分封制互为表里。', difficulty: 'easy' },
  { id: 'c8', title: '礼乐制度', category: '政治', front: '礼乐制度', back: '维护等级秩序的工具，"礼"区分等级，"乐"协调社会。', difficulty: 'medium' },
  { id: 'c9', title: '井田制', category: '经济', front: '井田制', back: '奴隶主土地国有制（周王所有），不得随意买卖，是西周经济基础。', difficulty: 'medium' },
  { id: 'c10', title: '小农经济', category: '经济', front: '小农经济', back: '以家庭为单位，农业与手工业结合，自给自足。封建经济基础。', difficulty: 'medium' },
  { id: 'c11', title: '商鞅变法', category: '政治', front: '商鞅变法', back: '前356年秦国变法。"废井田，开阡陌"确立土地私有；奖励军功；推行县制。', difficulty: 'hard' },
  { id: 'c12', title: '百家争鸣', category: '思想', front: '百家争鸣', back: '春秋战国思想解放运动，奠定了中国传统文化体系基础。', difficulty: 'easy' },
  { id: 'c13', title: '儒家思想', category: '思想', front: '儒家思想', back: '孔子创立，核心"仁"和"礼"。孟子发展"民贵君轻"，荀子隆礼重法。', difficulty: 'medium' },
  { id: 'c14', title: '法家思想', category: '思想', front: '法家思想', back: '韩非子集大成，主张以法治国、君主集权。', difficulty: 'medium' },
  { id: 'c15', title: '秦朝统一', category: '政治', front: '秦朝统一', back: '公元前221年，秦王嬴政灭六国，建立第一个统一的多民族封建国家。', difficulty: 'easy' },
  { id: 'c16', title: '专制主义中央集权', category: '政治', front: '专制主义中央集权', back: '皇帝制度+三公九卿+郡县制。皇权至上，官僚政治取代贵族政治。', difficulty: 'hard' },
  { id: 'c17', title: '郡县制', category: '政治', front: '郡县制', back: '地方行政制度，郡守县令由中央任免，打破贵族世袭。', difficulty: 'medium' },
  { id: 'c18', title: '汉武帝大一统', category: '政治', front: '汉武帝大一统', back: '推恩令削藩；"罢黜百家，独尊儒术"；盐铁官营；北击匈奴。', difficulty: 'hard' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get('unitId');
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');

  // Fallback 数据（始终可用）
  let fallbackCards = BUILT_IN_CARDS;
  if (category) {
    fallbackCards = fallbackCards.filter((c) => c.category === category);
  }
  if (difficulty) {
    fallbackCards = fallbackCards.filter((c) => c.difficulty === difficulty);
  }

  try {
    // 从Supabase查询（带超时保护）
    if (isSupabaseConfigured && supabase) {
      try {
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 2000)
        );
        const queryPromise = supabase
          .from('docx_imports')
          .select('*')
          .eq('unit_id', unitId || '')
          .limit(1)
          .single();
        const { data: docxImport } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (docxImport?.data) {
          const data = docxImport.data as any;
          let cards = data.cards || [];

          if (category) {
            cards = cards.filter((c: any) => c.category === category);
          }
          if (difficulty) {
            cards = cards.filter((c: any) => c.difficulty === difficulty);
          }

          return NextResponse.json({
            success: true,
            data: {
              cards,
              total: cards.length,
              unitTitle: data.unitTitle,
              source: 'docx',
            },
          });
        }
      } catch (e: any) {
        console.warn('[cards GET] Supabase 查询失败:', e.message);
      }
    }

    // Fallback：使用内置卡牌数据
    return NextResponse.json({
      success: true,
      data: {
        cards: fallbackCards,
        total: fallbackCards.length,
        unitTitle: '历史学习卡牌',
        source: 'builtin',
      },
    });
  } catch (err) {
    // 即使出错也返回 fallback
    return NextResponse.json({
      success: true,
      data: {
        cards: fallbackCards,
        total: fallbackCards.length,
        unitTitle: '历史学习卡牌',
        source: 'builtin',
      },
    });
  }
}
