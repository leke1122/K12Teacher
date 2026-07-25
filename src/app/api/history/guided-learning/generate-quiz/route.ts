import { NextRequest, NextResponse } from 'next/server';

// 高考历史常见考点
const GAOKAO_KEYWORDS: Record<string, string[]> = {
  'kp-1-1': ['元谋人', '北京人', '打制石器', '旧石器时代'],
  'kp-1-2': ['新石器时代', '磨制石器', '原始农业', '畜牧业'],
  'kp-1-3': ['仰韶文化', '河姆渡文化', '龙山文化', '良渚文化'],
  'kp-1-4': ['中华文明起源', '多元一体', '黄河流域', '长江流域'],
  'kp-1-5': ['禅让制', '世袭制', '尧舜禹', '私有制'],
  'kp-1-6': ['夏朝建立', '约前2070年', '禹', '世袭制', '家天下'],
  'kp-1-7': ['商朝', '盘庚迁殷', '青铜器', '甲骨文'],
  'kp-1-8': ['西周分封制', '周天子', '诸侯', '朝贡'],
  'kp-1-9': ['宗法制', '嫡长子继承', '血缘关系'],
  'kp-1-10': ['礼乐制度', '尊卑等级', '政治支柱'],
  'kp-1-11': ['井田制', '公田', '私田', '土地国有'],
  'kp-1-12': ['工商食官', '青铜器', '粟', '稻'],
  'kp-1-13': ['春秋争霸', '齐桓公', '晋文公', '楚庄王'],
  'kp-1-14': ['战国七雄', '韩赵魏楚燕齐秦', '变法图强'],
  'kp-1-15': ['商鞅变法', '废井田', '奖励军功', '重农抑商'],
  'kp-1-16': ['战国变法', '李悝变法', '吴起变法'],
  'kp-1-17': ['百家争鸣', '儒道法墨', '孔子', '孟子'],
  'kp-1-18': ['儒家思想', '仁', '礼', '中庸', '民贵君轻'],
  'kp-1-19': ['道家法家', '无为而治', '以法治国', '君主专制'],
  'kp-1-20': ['墨家', '兼爱', '非攻', '尚贤', '节用'],
  'kp-1-21': ['华夏认同', '华', '夏', '华夏族'],
  'kp-1-22': ['秦朝统一', '前221年', '秦始皇', '嬴政'],
  'kp-1-23': ['皇帝制度', '朕', '诏书', '至高无上'],
  'kp-1-24': ['三公九卿', '丞相', '太尉', '御史大夫'],
  'kp-1-25': ['郡县制', '郡守', '县令', '中央任免'],
  'kp-1-26': ['统一文字', '小篆', '圆形方孔钱', '度量衡'],
  'kp-1-27': ['秦律', '焚书坑儒', '轻罪重刑'],
  'kp-1-28': ['秦朝疆域', '长城', '直道', '灵渠'],
  'kp-1-29': ['秦朝灭亡', '陈胜吴广', '巨鹿之战', '项羽'],
  'kp-1-30': ['楚汉战争', '刘邦', '项羽', '垓下之战'],
  'kp-1-31': ['西汉建立', '前202年', '刘邦', '休养生息', '文景之治'],
  'kp-1-32': ['汉武帝', '大一统', '推恩令', '盐铁官营', '独尊儒术'],
  'kp-1-33': ['推恩令', '主父偃', '削藩'],
  'kp-1-34': ['盐铁官营', '财政', '抑制商贾'],
  'kp-1-35': ['北击匈奴', '卫青', '霍去病', '漠北之战'],
  'kp-1-36': ['张骞通西域', '丝绸之路', '西域都护'],
  'kp-1-37': ['察举制', '选官', '孝廉', '茂才'],
  'kp-1-38': ['独尊儒术', '董仲舒', '罢黜百家'],
  'kp-1-39': ['太学', '郡国学校', '最高学府'],
  'kp-1-40': ['丝绸之路', '东西方', '经济文化交流'],
  'kp-1-41': ['对外交流', '朝鲜', '日本', '越南'],
  'kp-1-42': ['汉代经济', '牛耕', '铁农具', '丝织业'],
  'kp-1-43': ['光武中兴', '刘秀', '东汉', '度田'],
  'kp-1-44': ['庄园经济', '豪强地主', '部曲', '地方割据'],
  'kp-1-45': ['汉代文化', '史记', '汉书', '张衡', '蔡伦'],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      unitId, 
      knowledgePointId, 
      knowledgePoint, 
      knowledgeDescription, 
      difficulty = 'medium', 
    } = body;

    const keywords = GAOKAO_KEYWORDS[knowledgePointId] || [];
    const keywordStr = keywords.join('、');

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.QWEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API Key not configured' });
    }

    // 简单的prompt，避免复杂的JSON在模板字符串中
    const diffText = difficulty === 'easy' ? '基础题' : difficulty === 'hard' ? '难题' : '中等题';
    
    // 构建prompt，分开处理避免JSON嵌套问题
    let prompt = '你是高考历史出题专家。\n\n';
    prompt += '知识点名称：' + knowledgePoint + '\n';
    prompt += '知识点内容：' + knowledgeDescription + '\n';
    prompt += '高考考点：' + keywordStr + '\n';
    prompt += '题目难度：' + diffText + '\n\n';
    prompt += '请出一道选择题，4个选项，直接返回JSON：\n';
    const jsonTemplate = JSON.stringify({
      question: '问题',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: '解析',
      difficulty: difficulty
    });
    prompt += jsonTemplate;
    
    console.log('Prompt:', prompt);

    const isQwenKey = apiKey.startsWith('sk-ws-') && apiKey.includes('.mctz.');
    
    const response = await fetch(
      isQwenKey 
        ? 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        : 'https://api.deepseek.com/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: isQwenKey ? 'qwen-plus' : 'deepseek-v4-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: 'AI API error: ' + errorText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析JSON
    let question = null;
    try {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = match ? match[1] : content;
      question = JSON.parse(jsonStr.trim());
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          question = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json({ success: false, error: 'Failed to parse JSON', raw: content });
        }
      }
    }
    
    if (!question || !question.question || !question.options) {
      return NextResponse.json({ success: false, error: 'Invalid question format', raw: content });
    }

    return NextResponse.json({
      success: true,
      question: {
        id: `q-${knowledgePointId}-${Date.now()}`,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        difficulty: question.difficulty || difficulty,
        relatedKnowledge: [knowledgePointId],
      }
    });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + (error?.message || String(error)) });
  }
}
