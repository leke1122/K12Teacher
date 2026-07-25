import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

interface QuizQuestion {
  question: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
}

// 预定义题目库 - 按知识点组织
const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  '天体': [
    {
      question: '下列属于天体的是？',
      options: shuffleOptionsStatic([
        { text: '月球', isCorrect: true },
        { text: '地面上的陨石', isCorrect: false },
        { text: '天空中飞行的飞机', isCorrect: false },
        { text: '地球大气层中的云', isCorrect: false },
      ]),
      explanation: '天体必须位于地球大气层之外。月球位于大气层之外，是天体；陨石落地后不是天体；飞机和云都在大气层内。',
    },
    {
      question: '宇宙中最基本的天体是？',
      options: shuffleOptionsStatic([
        { text: '恒星和星云', isCorrect: true },
        { text: '行星和卫星', isCorrect: false },
        { text: '彗星和流星', isCorrect: false },
        { text: '地球和月球', isCorrect: false },
      ]),
      explanation: '恒星和星云是宇宙中最基本的天体。恒星能自己发光发热，星云由气体和尘埃组成，两者是最基础的物质形式。',
    },
    {
      question: '判断某一物体是否为天体的标准是？',
      options: shuffleOptionsStatic([
        { text: '一看位置（是否位于大气层之外）、二看整体（是否是某天体的一部分）、三看轨道（是否有独立的运行轨道）', isCorrect: true },
        { text: '一看是否发光、二看体积大小、三看距离远近', isCorrect: false },
        { text: '一看温度高低、二看密度大小、三看运动速度', isCorrect: false },
        { text: '只需要看是否在太空中', isCorrect: false },
      ]),
      explanation: '判断天体的"三看法"：一看位置（大气层之外）、二看整体（是否是某天体的一部分）、三看轨道（是否有独立运行轨道）。',
    },
    {
      question: '下列关于流星和陨星的说法，正确的是？',
      options: shuffleOptionsStatic([
        { text: '流星体是天体；流星现象和陨星不是天体', isCorrect: true },
        { text: '三者都是天体', isCorrect: false },
        { text: '三者都不是天体', isCorrect: false },
        { text: '流星现象是天体', isCorrect: false },
      ]),
      explanation: '流星体（太空中）是天体；流星现象（进入大气层燃烧）是天象不是天体；陨星（落地后）是地面的岩石，不是天体。',
    },
    {
      question: '关于人造卫星的说法，正确的是？',
      options: shuffleOptionsStatic([
        { text: '待发射的人造卫星不是天体；进入太空轨道运行后才是天体', isCorrect: true },
        { text: '只要制造出来就是天体', isCorrect: false },
        { text: '只要离开地面就是天体', isCorrect: false },
        { text: '人造卫星永远不是天体', isCorrect: false },
      ]),
      explanation: '人造卫星需要进入太空轨道运行后，才算具有独立运行轨道的天体。发射前或仍在地面上的不是天体。',
    },
    // 新增多样化题目
    {
      question: '下列物质中，不属于天体的是？',
      options: shuffleOptionsStatic([
        { text: '地球上的海洋', isCorrect: true },
        { text: '织女星', isCorrect: false },
        { text: '哈雷彗星', isCorrect: false },
        { text: '太阳', isCorrect: false },
      ]),
      explanation: '织女星、哈雷彗星、太阳都是天体（位于大气层之外）。地球上的海洋是地球的一部分，不是独立的天体。',
    },
    {
      question: '星云与恒星的主要区别是？',
      options: shuffleOptionsStatic([
        { text: '星云由气体和尘埃组成，不发光；恒星能发光发热', isCorrect: true },
        { text: '星云体积比恒星大', isCorrect: false },
        { text: '星云温度比恒星高', isCorrect: false },
        { text: '星云在运动，恒星静止', isCorrect: false },
      ]),
      explanation: '星云是由气体和尘埃组成的星际物质，不发光但能反射星光；恒星能通过核聚变产生能量而发光发热。',
    },
    {
      question: '天体可分为哪两大类？',
      options: shuffleOptionsStatic([
        { text: '自然天体和人造天体', isCorrect: true },
        { text: '恒星和行星', isCorrect: false },
        { text: '气体天体和固体天体', isCorrect: false },
        { text: '发光天体和不发光天体', isCorrect: false },
      ]),
      explanation: '天体可分为自然天体（如恒星、行星、星云等）和人造天体（如人造卫星、空间站等）。',
    },
    {
      question: '下列天体中，质量和体积最大的是？',
      options: shuffleOptionsStatic([
        { text: '太阳', isCorrect: true },
        { text: '地球', isCorrect: false },
        { text: '月球', isCorrect: false },
        { text: '火星', isCorrect: false },
      ]),
      explanation: '太阳是太阳系的中心恒星，质量占太阳系总质量的99.86%，体积是地球的130万倍。',
    },
    {
      question: '关于彗星的描述，正确的是？',
      options: shuffleOptionsStatic([
        { text: '彗星由彗核、彗发、彗尾组成，越接近太阳彗尾越长', isCorrect: true },
        { text: '彗星是恒星的一种', isCorrect: false },
        { text: '彗星的轨道是圆形的', isCorrect: false },
        { text: '彗星是固体状态的天体', isCorrect: false },
      ]),
      explanation: '彗星由彗核（冰物质）、彗发（气体云）、彗尾（气体和尘埃）组成。接近太阳时，受太阳辐射影响，彗尾变长。',
    },
    {
      question: '2020年12月，嫦娥五号探测器携带月球样品返回地球。在整个返回过程中，嫦娥五号属于天体的时间段是？',
      options: shuffleOptionsStatic([
        { text: '从进入环月轨道到返回地球着陆前', isCorrect: true },
        { text: '从发射到返回全过程', isCorrect: false },
        { text: '只在月球表面采样时', isCorrect: false },
        { text: '仅在太空中飞行时', isCorrect: false },
      ]),
      explanation: '判断天体需要"三看"：位置（大气层外）、整体（不是某天体的一部分）、轨道（独立运行轨道）。嫦娥五号在地面和月球表面时不是天体。',
    },
    {
      question: '流星现象发生在哪个大气层？',
      options: shuffleOptionsStatic([
        { text: '高层大气', isCorrect: true },
        { text: '对流层', isCorrect: false },
        { text: '平流层', isCorrect: false },
        { text: '电离层', isCorrect: false },
      ]),
      explanation: '流星现象发生在高层大气（80-110km高度）。流星体进入大气层后与大气摩擦燃烧，产生亮光。',
    },
    {
      question: '下列关于恒星的说法，错误的是？',
      options: shuffleOptionsStatic([
        { text: '恒星是静止不动的', isCorrect: true },
        { text: '恒星能自己发光发热', isCorrect: false },
        { text: '恒星的主要成分是氢和氦', isCorrect: false },
        { text: '太阳是一颗恒星', isCorrect: false },
      ]),
      explanation: '恒星并非静止不动，而是在宇宙中高速运动（如太阳以约220km/s绕银河系中心运动）。恒星能自己发光发热，主要成分是氢和氦。',
    },
    {
      question: '天体系统等级从低到高的排列，正确的是？',
      options: shuffleOptionsStatic([
        { text: '地月系→太阳系→银河系→河外星系→总星系', isCorrect: true },
        { text: '地月系→银河系→太阳系→总星系', isCorrect: false },
        { text: '行星→卫星→恒星→星系→宇宙', isCorrect: false },
        { text: '太阳系→银河系→地月系→总星系', isCorrect: false },
      ]),
      explanation: '天体系统的层次是：行星系统（如地月系）→恒星系统（如太阳系）→星系（如银河系）→星系群/团→总星系（可观测宇宙）。',
    },
    {
      question: '下列现象中，可证明地球是一个球体的是？',
      options: shuffleOptionsStatic([
        { text: '月食时地球影子是圆形的', isCorrect: true },
        { text: '太阳东升西落', isCorrect: false },
        { text: '四季更替', isCorrect: false },
        { text: '昼夜长短变化', isCorrect: false },
      ]),
      explanation: '月食发生时，地球挡住太阳光，在月球上投下的影子始终是圆形的，只有球体在任何角度的影子都呈圆形。',
    },
  ],
  '天体系统': [
    {
      question: '天体系统形成的基本条件是？',
      options: shuffleOptionsStatic([
        { text: '天体之间相互吸引且相互绕转', isCorrect: true },
        { text: '多个天体聚集在一起', isCorrect: false },
        { text: '天体之间相互吸引', isCorrect: false },
        { text: '天体之间相互绕转', isCorrect: false },
      ]),
      explanation: '天体系统的形成需要两个条件：相互吸引和相互绕转。单个天体不能形成天体系统。',
    },
    {
      question: '天体系统由小到大的层次排列正确的是？',
      options: shuffleOptionsStatic([
        { text: '地月系→太阳系→银河系→可观测宇宙', isCorrect: true },
        { text: '地月系→银河系→太阳系→可观测宇宙', isCorrect: false },
        { text: '太阳系→地月系→银河系→可观测宇宙', isCorrect: false },
        { text: '银河系→太阳系→地月系→可观测宇宙', isCorrect: false },
      ]),
      explanation: '天体系统由小到大依次是：地月系→太阳系→银河系→可观测宇宙（总星系）。',
    },
    {
      question: '下列天体系统中，不包含地球的是？',
      options: shuffleOptionsStatic([
        { text: '河外星系', isCorrect: true },
        { text: '地月系', isCorrect: false },
        { text: '太阳系', isCorrect: false },
        { text: '银河系', isCorrect: false },
      ]),
      explanation: '地球属于银河系→太阳系→地月系，与河外星系无包含关系。河外星系与银河系是并列关系。',
    },
  ],
  '太阳系': [
    {
      question: '太阳系八大行星中，距太阳由近到远排在第四位的是？',
      options: shuffleOptionsStatic([
        { text: '地球', isCorrect: true },
        { text: '金星', isCorrect: false },
        { text: '火星', isCorrect: false },
        { text: '木星', isCorrect: false },
      ]),
      explanation: '八大行星距太阳由近到远依次是：水星、金星、地球、火星、木星、土星、天王星、海王星。地球排在第四位。',
    },
    {
      question: '小行星带位于哪两颗行星之间？',
      options: shuffleOptionsStatic([
        { text: '火星和木星之间', isCorrect: true },
        { text: '木星和土星之间', isCorrect: false },
        { text: '地球和火星之间', isCorrect: false },
        { text: '金星和地球之间', isCorrect: false },
      ]),
      explanation: '小行星带位于火星和木星之间，位于类地行星和巨行星之间。这是高考常考知识点！',
    },
    {
      question: '下列行星中，属于类地行星的是？',
      options: shuffleOptionsStatic([
        { text: '水星、金星、地球、火星', isCorrect: true },
        { text: '木星、土星、天王星、海王星', isCorrect: false },
        { text: '地球、木星、土星', isCorrect: false },
        { text: '火星、木星、天王星', isCorrect: false },
      ]),
      explanation: '类地行星包括水星、金星、地球、火星，它们靠近太阳，有固体表面，体积较小。',
    },
    {
      question: '太阳系八大行星的共同运动特征是？',
      options: shuffleOptionsStatic([
        { text: '同向性（自西向东）、共面性、近圆性', isCorrect: true },
        { text: '方向相同、大小相同、轨道相同', isCorrect: false },
        { text: '都是逆时针方向', isCorrect: false },
        { text: '公转周期相同', isCorrect: false },
      ]),
      explanation: '八大行星的共同运动特征是：同向性（公转方向相同）、共面性（轨道几乎在同一平面）、近圆性（轨道接近圆形）。',
    },
  ],
  '太阳活动': [
    {
      question: '太阳活动的主要标志是？',
      options: shuffleOptionsStatic([
        { text: '太阳黑子和耀斑', isCorrect: true },
        { text: '太阳风和日冕', isCorrect: false },
        { text: '太阳辐射和光球', isCorrect: false },
        { text: '日珥和日冕物质抛射', isCorrect: false },
      ]),
      explanation: '太阳活动的主要标志是太阳黑子和耀斑，它们周期约为11年。黑子发生在光球层，耀斑发生在色球层。',
    },
    {
      question: '太阳活动对地球的影响不包括？',
      options: shuffleOptionsStatic([
        { text: '直接导致地震', isCorrect: true },
        { text: '产生磁暴，影响短波通信', isCorrect: false },
        { text: '产生极光现象', isCorrect: false },
        { text: '影响卫星导航和航天活动', isCorrect: false },
      ]),
      explanation: '太阳活动会影响：①电离层（短波通信）②磁场（磁暴）③极光（高纬度）④航天活动。太阳活动不直接导致地震。',
    },
    {
      question: '极光现象产生的主要原因是？',
      options: shuffleOptionsStatic([
        { text: '太阳活动抛射的带电粒子流进入地球磁场', isCorrect: true },
        { text: '地球大气层的自然发光现象', isCorrect: false },
        { text: '太阳直射导致的', isCorrect: false },
        { text: '地球磁场直接产生', isCorrect: false },
      ]),
      explanation: '极光由太阳活动（主要是日冕物质抛射）抛射的带电粒子流进入地球磁场，激发大气中的原子和分子产生的发光现象。',
    },
  ],
  '地球': [
    {
      question: '地球内部圈层由外向内的顺序是？',
      options: shuffleOptionsStatic([
        { text: '地壳→地幔→地核', isCorrect: true },
        { text: '地核→地幔→地壳', isCorrect: false },
        { text: '地幔→地壳→地核', isCorrect: false },
        { text: '地壳→地核→地幔', isCorrect: false },
      ]),
      explanation: '地球内部圈层由外向内依次是：地壳、地幔、地核。地震波的传播速度是判断地球内部圈层的重要依据。',
    },
    {
      question: '地震波中的横波和纵波，传播速度的特点是？',
      options: shuffleOptionsStatic([
        { text: '横波只能在固体中传播，纵波可通过固液气三态', isCorrect: true },
        { text: '两者传播速度相同', isCorrect: false },
        { text: '横波传播更快', isCorrect: false },
        { text: '两者都只能在固体中传播', isCorrect: false },
      ]),
      explanation: '纵波（P波）传播速度较快，可通过固体、液体、气体；横波（S波）传播速度较慢，只能通过固体。这是推断地球外核为液态的重要依据。',
    },
  ],
  '大气': [
    {
      question: '大气垂直分层中，气温随高度增加而上升的是？',
      options: shuffleOptionsStatic([
        { text: '平流层', isCorrect: true },
        { text: '对流层', isCorrect: false },
        { text: '高层大气', isCorrect: false },
        { text: '对流层和平流层', isCorrect: false },
      ]),
      explanation: '平流层气温随高度增加而上升，因为臭氧层吸收紫外线。对流层气温随高度增加而下降。',
    },
    {
      question: '对流层的主要特征是？',
      options: shuffleOptionsStatic([
        { text: '气温随高度递减、大气对流运动显著、天气现象复杂多变', isCorrect: true },
        { text: '气温随高度递增、大气水平运动为主', isCorrect: false },
        { text: '大气稳定、天气晴朗', isCorrect: false },
        { text: '空气稀薄、电离现象明显', isCorrect: false },
      ]),
      explanation: '对流层气温随高度递减（约0.6℃/100m），大气对流运动显著，天气现象复杂多变。与人类生活关系最密切。',
    },
    {
      question: '逆温现象是指？',
      options: shuffleOptionsStatic([
        { text: '气温随高度升高而升高的现象', isCorrect: true },
        { text: '气温随高度降低而降低的现象', isCorrect: false },
        { text: '气温不变化的现象', isCorrect: false },
        { text: '对流层气温异常升高的现象', isCorrect: false },
      ]),
      explanation: '逆温是指气温随高度升高而升高的现象，与正常的气温递减规律相反。逆温会导致大气稳定，污染物不易扩散。',
    },
  ],
  '热力环流': [
    {
      question: '热力环流的形成原因是？',
      options: shuffleOptionsStatic([
        { text: '地区间冷热不均', isCorrect: true },
        { text: '地球自转偏向', isCorrect: false },
        { text: '海陆分布差异', isCorrect: false },
        { text: '地形起伏', isCorrect: false },
      ]),
      explanation: '热力环流是由地区间冷热不均引起的空气垂直运动及其水平运动。热处低压上升，冷处高压下沉。',
    },
    {
      question: '"热升冷降"规律中，热处和冷处分别形成？',
      options: shuffleOptionsStatic([
        { text: '热处：低压，上升气流；冷处：高压，下沉气流', isCorrect: true },
        { text: '热处：高压，上升气流；冷处：低压，下沉气流', isCorrect: false },
        { text: '热处：低压，下沉气流；冷处：高压，上升气流', isCorrect: false },
        { text: '热处和冷处都形成低压', isCorrect: false },
      ]),
      explanation: '"热升冷降"是热力环流的基本规律：热处空气受热膨胀上升，形成低压；冷处空气冷却收缩下沉，形成高压。',
    },
  ],
  '地质年代': [
    {
      question: '地质年代中，恐龙繁盛的时期是？',
      options: shuffleOptionsStatic([
        { text: '中生代', isCorrect: true },
        { text: '古生代', isCorrect: false },
        { text: '新生代', isCorrect: false },
        { text: '元古代', isCorrect: false },
      ]),
      explanation: '中生代是恐龙繁盛的时代，包括三叠纪、侏罗纪和白垩纪。中生代也被称为"恐龙时代"。',
    },
    {
      question: '地质历史上的主要成煤期是？',
      options: shuffleOptionsStatic([
        { text: '古生代和中生代', isCorrect: true },
        { text: '元古代和古生代', isCorrect: false },
        { text: '中生代和新生代', isCorrect: false },
        { text: '只有古生代', isCorrect: false },
      ]),
      explanation: '古生代蕨类植物繁盛，中生代裸子植物繁盛，两者都是重要成煤期。煤炭是地质历史时期植物遗体埋藏地下形成的。',
    },
  ],
};

// 静态选项打乱（不依赖运行时随机）
function shuffleOptionsStatic<T extends { text: string; isCorrect: boolean }>(options: T[]): Array<{ id: string; text: string; isCorrect: boolean }> {
  // 使用固定的打乱模式（基于选项文本的hash）
  const hash = options.reduce((acc, opt) => acc + opt.text.charCodeAt(0), 0);
  const shuffled = hash % 2 === 0 
    ? [...options] 
    : [options[1], options[0], options[3], options[2]];
  
  const ids = ['A', 'B', 'C', 'D'];
  return shuffled.map((opt, idx) => ({
    id: ids[idx],
    text: opt.text,
    isCorrect: opt.isCorrect,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, count = 1, previousQuestions = [], deepseekKey: clientApiKey, difficulty = '中等' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 优先使用客户端传入的 API Key，其次使用服务器环境变量
    const apiKey = clientApiKey || DEEPSEEK_API_KEY;

    console.log('[Geography Quiz] 生成题目:', title, '数量:', count, '难度:', difficulty, '已回答:', previousQuestions.length);

    let questions: QuizQuestion[] = [];

    // 调用AI生成题目（确保不重复）
    if (apiKey && previousQuestions.length < 10) {
      try {
        questions = await generateQuestionsWithAI(title, content, count, previousQuestions, apiKey, difficulty);
        console.log('[Geography Quiz] AI生成成功，数量:', questions.length);
      } catch (err) {
        console.error('[Geography Quiz] AI生成失败:', err);
      }
    }

    // 如果AI生成失败或不足，从题库获取
    if (questions.length < count) {
      const skipCount = previousQuestions.length;
      const bankQuestions = getQuestionsFromBank(title, content, count - questions.length, previousQuestions, skipCount);
      questions = [...questions, ...bankQuestions].slice(0, count);
      console.log('[Geography Quiz] 题库补充后总数:', questions.length, '跳过:', skipCount);
    }

    return NextResponse.json({
      success: true,
      questions,
      source: apiKey ? 'ai' : 'bank',
    });
  } catch (err) {
    console.error('[Geography Quiz] 错误:', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

// AI生成题目
async function generateQuestionsWithAI(
  title: string,
  content: string,
  count: number,
  previousQuestions: string[],
  apiKey: string,
  difficulty: string = '中等'
): Promise<QuizQuestion[]> {
  let difficultyInstruction = '';
  if (difficulty.includes('简单')) {
    difficultyInstruction = '题目要简单，主要考察基本概念和直接记忆，选项要直白，迷惑性选项要少。';
  } else if (difficulty.includes('困难') || difficulty.includes('难')) {
    difficultyInstruction = '题目要有难度，需要综合分析、对比判断、计算推理，迷惑性选项要强，要考察学生对知识点的深入理解。';
  } else {
    difficultyInstruction = '题目难度中等，考察对知识点的理解和简单应用，迷惑性选项要合理。';
  }
  
  const systemPrompt = `你是一位高中地理老师，专门为学生设计高考风格的选择题。

请基于以下知识点内容，设计 ${count} 道单选题。题目必须：
1. 紧密围绕知识点内容，考察核心概念
2. 选项要有区分度，迷惑性选项要合理
3. 解析要清晰说明为什么正确选项正确
4. 严格遵循高考选择题风格
5. ${difficultyInstruction}

输出格式：
{
  "questions": [
    {
      "question": "题目内容（要有具体情境或明确提问）",
      "options": [
        {"id": "A", "text": "选项A"},
        {"id": "B", "text": "选项B"},
        {"id": "C", "text": "选项C"},
        {"id": "D", "text": "选项D"}
      ],
      "correctAnswer": "A",
      "explanation": "详细解析"
    }
  ]
}

只返回JSON。`;

  const userPrompt = `知识点标题：${title}

知识点内容：
${content.substring(0, 4000)}

${previousQuestions.length > 0 ? `已出过的题目（请务必生成不同的题目）：
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

请生成1道与上述题目不同的新题目。` : '请生成1道高考风格的选择题。'}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`API返回错误: ${response.status}`);
  }

  const data = await response.json();
  const aiContent = data.choices?.[0]?.message?.content || '';
  
  const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI返回格式错误');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  return (parsed.questions || []).map((q: {
    question: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
  }) => ({
    question: q.question,
    options: q.options.map(o => ({
      id: o.id,
      text: o.text,
      isCorrect: o.id === q.correctAnswer,
    })),
    explanation: q.explanation,
  }));
}

// 从题库获取题目（使用 skipIndex 避免重复）
function getQuestionsFromBank(title: string, content: string, count: number, previousQuestions: string[], skipIndex: number): QuizQuestion[] {
  const topic = title.replace(/^\d+[、.]\s*/, '').trim();
  const topicLower = topic.toLowerCase();
  
  // 找到匹配的题库
  let questionBank: QuizQuestion[] = [];
  
  if (topicLower.includes('天体') && !topicLower.includes('系统')) {
    questionBank = [...QUESTION_BANK['天体'] || []];
  } else if (topicLower.includes('天体系统')) {
    questionBank = [...QUESTION_BANK['天体系统'] || [], ...QUESTION_BANK['天体'] || []];
  } else if (topicLower.includes('太阳系') || topicLower.includes('八大行星')) {
    questionBank = QUESTION_BANK['太阳系'] || [];
  } else if (topicLower.includes('太阳活动')) {
    questionBank = QUESTION_BANK['太阳活动'] || [];
  } else if (topicLower.includes('圈层') || (topicLower.includes('地球') && !topicLower.includes('生命'))) {
    questionBank = QUESTION_BANK['地球'] || [];
  } else if (topicLower.includes('大气')) {
    questionBank = [...QUESTION_BANK['大气'] || [], ...QUESTION_BANK['热力环流'] || []];
  } else if (topicLower.includes('热力环流')) {
    questionBank = QUESTION_BANK['热力环流'] || [];
  } else if (topicLower.includes('地质年代') || topicLower.includes('生物演化')) {
    questionBank = QUESTION_BANK['地质年代'] || [];
  } else {
    // 通用题库
    Object.values(QUESTION_BANK).forEach(bank => {
      questionBank.push(...bank);
    });
  }
  
  // 过滤掉已回答的题目
  const availableQuestions = questionBank.filter(q => !previousQuestions.includes(q.question));
  
  // 如果可用题目不够，生成通用题目
  if (availableQuestions.length < count) {
    const genericQuestions = generateGenericQuestions(topic, content, count - availableQuestions.length, previousQuestions);
    return [...availableQuestions, ...genericQuestions].slice(0, count);
  }
  
  // 使用 skipIndex 从剩余题目中获取（循环使用）
  if (skipIndex >= availableQuestions.length) {
    // 如果跳过数量超过可用题目，使用循环模式
    const adjustedIndex = skipIndex % availableQuestions.length;
    return availableQuestions.slice(adjustedIndex, adjustedIndex + count);
  }
  
  return availableQuestions.slice(skipIndex, skipIndex + count);
}

// 生成通用题目
function generateGenericQuestions(topic: string, content: string, count: number, previousQuestions: string[]): QuizQuestion[] {
  // 提取关键术语
  const terms: string[] = [];
  const termMatches = content.match(/([\u4e00-\u9fa5]{2,8})(?:是|指|称为|叫做)/g) || [];
  termMatches.forEach(m => {
    const term = m.replace(/(?:是|指|称为|叫做)$/, '');
    if (term.length >= 2 && term.length <= 10 && !terms.includes(term)) {
      terms.push(term);
    }
  });
  
  const questions: QuizQuestion[] = [];
  const term = terms[0] || topic;
  
  if (count >= 1) {
    questions.push({
      question: `${term}是指什么？`,
      options: shuffleOptionsStatic([
        { text: `根据知识点，${term}的正确含义`, isCorrect: true },
        { text: '与之完全不同的错误概念', isCorrect: false },
        { text: '混淆了相关但不同的概念', isCorrect: false },
        { text: '无关的描述', isCorrect: false },
      ]),
      explanation: `${term}是本节的重要概念，需要准确理解。`,
    });
  }
  
  if (count >= 2) {
    questions.push({
      question: `关于${topic}的说法，以下正确的是？`,
      options: shuffleOptionsStatic([
        { text: '符合知识点内容的正确说法', isCorrect: true },
        { text: '与知识点内容相反的说法', isCorrect: false },
        { text: '混淆了相关概念的说法', isCorrect: false },
        { text: '超出知识范围的错误说法', isCorrect: false },
      ]),
      explanation: `学习${topic}时需要注意区分相似概念。`,
    });
  }
  
  if (count >= 3) {
    questions.push({
      question: `${topic}的主要特征是？`,
      options: shuffleOptionsStatic([
        { text: '符合知识点描述的主要特征', isCorrect: true },
        { text: '与其他事物混淆的特征', isCorrect: false },
        { text: '错误理解产生的特征', isCorrect: false },
        { text: '与知识点无关的描述', isCorrect: false },
      ]),
      explanation: `${topic}具有知识点中描述的主要特征。`,
    });
  }
  
  return questions.slice(0, count);
}
