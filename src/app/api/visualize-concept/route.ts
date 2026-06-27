import { NextRequest, NextResponse } from 'next/server';
import type { Grade } from '@/stores/gradeStore';

// ==================== 可视化概念定义 ====================

interface VisualizationData {
  type: 'function_curve' | 'venn_diagram' | 'arrow_mapping' | 'bar_chart' | 'symmetry';
  title: string;
  description: string;
  data: unknown;
}

interface Analogy {
  title: string;
  description: string;
  steps: string[];
}

interface Question {
  question: string;
  options: string[];
  correct: string;
  hint: string;
  explanation: string;
}

interface GuidedStep {
  step: number;
  prompt: string;
  type: 'observe' | 'calculate' | 'describe' | 'choose';
}

interface ConceptViz {
  concept: string;
  conceptName: string;
  definition: string;
  visualization: VisualizationData;
  analogies: Analogy[];
  questions: Question[];
  guidedSteps: GuidedStep[];
}

// ==================== 预定义可视化内容 ====================

const CONCEPT_VIZ_DB: Record<string, ConceptViz> = {
  function: {
    concept: 'function',
    conceptName: '函数',
    definition: '函数是一种对应关系：对于定义域中的每一个 x，都有唯一确定的 y 与之对应。记作 y = f(x)。',
    visualization: {
      type: 'function_curve',
      title: 'y = x² 函数图像',
      description: '观察：当 x 变化时，y 如何变化？',
      data: {
        equation: 'y = x²',
        points: [[-3, 9], [-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4], [3, 9]],
        domain: [-3, 3],
        range: [0, 9],
        // 预设描点序列，用于动画展示
        animationSequence: [
          { x: 0, y: 0 },
          { x: 1, y: 1 }, { x: -1, y: 1 },
          { x: 2, y: 4 }, { x: -2, y: 4 },
          { x: 3, y: 9 }, { x: -3, y: 9 },
        ],
      },
    },
    analogies: [
      {
        title: '自动售货机',
        description: '函数就像自动售货机：你投一枚硬币（输入 x），机器按规则输出一种商品（输出 y）。每个价格只能买到一种商品，一个 x 只对应一个 y。',
        steps: ['投入硬币 x = 5 元', '机器规则：投入金额 × 1 = 找回零钱', '输出零钱 y = 5 元'],
      },
      {
        title: '菜谱做菜',
        description: '函数就像做菜：按照菜谱（函数规则），放入食材（输入 x），做出成品（输出 y）。同样的食材，按同样的菜谱，做出的菜是一样的。',
        steps: ['准备食材：2个番茄（x = 2）', '菜谱规则：番茄 × 2 = 番茄泥', '产出成品：4份番茄泥（y = 4）'],
      },
      {
        title: '快递打包',
        description: '函数就像寄快递：你填一张快递单（输入 x），快递公司按流程处理，最终送到收件人手里（输出 y）。每张单号对应唯一的包裹。',
        steps: ['填写单号：x = 你的地址', '快递规则：地址 → 距离 × 运费', '送达目的地：运费 y 元'],
      },
    ],
    questions: [
      {
        question: '如果输入 x = 3，根据 y = x²，输出的 y 是多少？',
        options: ['3', '6', '9', '27'],
        correct: '9',
        hint: '🧠 想一想：x² 意味着什么？把 x 乘以自己！',
        explanation: 'x² = x × x，所以 3² = 3 × 3 = 9。图像上就是找 x = 3 那个点对应的 y 值。',
      },
      {
        question: 'x = 0 时，y = x² 的值是多少？',
        options: ['0', '1', '-1', '无法确定'],
        correct: '0',
        hint: '🧠 想一想：0 乘以 0 等于多少？图像上就是原点 (0, 0)',
        explanation: '0² = 0 × 0 = 0，所以原点 (0, 0) 在函数图像上。',
      },
      {
        question: '下列哪个图像可以表示 y = x²？',
        options: ['一条直线', '开口向上的抛物线', '开口向下的抛物线', '折线'],
        correct: '开口向上的抛物线',
        hint: '🧠 想一想：x² 总是正数（或零），所以图像应该在 x 轴上方，且两边对称',
        explanation: 'y = x² 的图像是"U"字形的抛物线，开口向上，顶点是原点 (0, 0)。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察这个图像，x 从 -3 变到 3 时，y 的值是怎么变化的？', type: 'observe' },
      { step: 2, prompt: '🧠 如果 x = 2，y 是多少？x = -2 呢？发现了什么规律？', type: 'calculate' },
      { step: 3, prompt: '🧠 这个函数的图像有什么特点？（提示：关于哪个轴对称？）', type: 'describe' },
      { step: 4, prompt: '这个函数叫"二次函数"，你能猜到"二次"是什么意思吗？', type: 'choose' },
    ],
  },

  set: {
    concept: 'set',
    conceptName: '集合',
    definition: '集合是把某些确定的对象汇在一起组成的一个整体。元素 a 属于集合 A，记作 a ∈ A。',
    visualization: {
      type: 'venn_diagram',
      title: '集合的维恩图表示',
      description: '用圆圈表示集合，观察各区域代表什么含义',
      data: {
        setA: { name: 'A', elements: ['1', '2', '3', '4'], color: '#6366f1' },
        setB: { name: 'B', elements: ['3', '4', '5', '6'], color: '#f59e0b' },
        // 演示用的维恩图数据
        circles: [
          { cx: 150, cy: 150, rx: 100, ry: 100, label: 'A', color: '#6366f1' },
          { cx: 220, cy: 150, rx: 100, ry: 100, label: 'B', color: '#f59e0b' },
        ],
        regions: [
          { name: 'A ∩ B', label: '交集：A和B共同拥有的', color: '#8b5cf6', highlight: true },
          { name: 'A ∪ B', label: '并集：A或B拥有的', color: '#3b82f6', highlight: false },
          { name: 'A的补集', label: '补集：不在A中的所有', color: '#94a3b8', highlight: false },
        ],
      },
    },
    analogies: [
      {
        title: '班级里的同学',
        description: '集合就像一个班级：班级是一个"集合"，每个同学是其中的"元素"。小明是高一(1)班的一员 → 小明 ∈ 高一(1)班。',
        steps: ['集合 = 高一(1)班', '元素 = 班里的每位同学', '属于 = 小明 ∈ 高一(1)班', '不属于 = 隔壁班的小红 ∉ 高一(1)班'],
      },
      {
        title: '购物车里的商品',
        description: '购物车就是一个"集合"，加入购物车的每件商品就是"元素"。结算时，购物车里的所有商品构成一个集合。',
        steps: ['集合 = 购物车', '元素 = 每件商品', '子集 = 如果你只买零食，那零食是购物车的子集'],
      },
      {
        title: '水果篮',
        description: '一个水果篮（集合）里有苹果、香蕉、橙子（元素）。如果篮子里只有苹果，那"苹果集合"和"水果篮集合"相等。',
        steps: ['全集 = 水果篮（苹果、香蕉、橙子）', '子集 = 只有苹果的组合', '交集 = 同时出现在两个篮子里的水果'],
      },
    ],
    questions: [
      {
        question: '已知 A = {1, 2, 3}，B = {2, 3, 4}，A ∩ B = ？',
        options: ['{1, 2, 3}', '{2, 3, 4}', '{2, 3}', '{1, 4}'],
        correct: '{2, 3}',
        hint: '🧠 想一想：交集就是 A 和 B "共同拥有" 的元素！',
        explanation: 'A 和 B 共同拥有的元素是 2 和 3，所以 A ∩ B = {2, 3}。',
      },
      {
        question: '已知 A = {1, 2, 3}，B = {2, 3, 4}，A ∪ B = ？',
        options: ['{2, 3}', '{1, 2, 3, 4}', '{1, 4}', '{1, 2, 3}'],
        correct: '{1, 2, 3, 4}',
        hint: '🧠 想一想：并集就是 A 和 B "加在一起"（去重）！',
        explanation: 'A ∪ B = A 和 B 的全部元素去重合并 = {1, 2, 3, 4}。',
      },
      {
        question: '空集 Φ 和任何集合 A 的关系是？',
        options: ['Φ ∈ A', 'Φ ⊂ A', 'Φ ⊃ A', 'Φ = A'],
        correct: 'Φ ⊂ A',
        hint: '🧠 想一想：空集里什么都没有，是不是"完全在"任何集合里？',
        explanation: '空集是任何非空集合的子集。因为空集没有任何元素，所以它的所有元素（无）都在集合 A 中。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察维恩图：左边的圆圈 A 和右边的圆圈 B，它们重叠的区域代表什么？', type: 'observe' },
      { step: 2, prompt: '🧠 如果 A = {1,2,3}，B = {3,4,5}，A ∩ B = ？', type: 'calculate' },
      { step: 3, prompt: '🧠 能否用一句话描述：什么是"交集"？', type: 'describe' },
      { step: 4, prompt: '你觉得"并集"和"交集"的主要区别是什么？', type: 'choose' },
    ],
  },

  subset: {
    concept: 'subset',
    conceptName: '子集',
    definition: '若集合 A 的每一个元素都属于集合 B，则 A 是 B 的子集，记作 A ⊆ B。',
    visualization: {
      type: 'venn_diagram',
      title: '子集关系图',
      description: '观察：子集的圆圈完全"装在"父集合里',
      data: {
        circles: [
          { cx: 200, cy: 150, rx: 130, ry: 100, label: 'B', color: '#3b82f6' },
          { cx: 200, cy: 150, rx: 80, ry: 60, label: 'A', color: '#8b5cf6' },
        ],
        regions: [
          { name: 'A ⊆ B', label: 'A完全在B内部', color: '#8b5cf6', highlight: true },
        ],
      },
    },
    analogies: [
      {
        title: '盒子里的袋子',
        description: '子集就像一个大盒子里的小袋子：大盒子是 B，小袋子是 A。袋子里所有东西肯定在盒子里（元素都属于），所以袋子是盒子的子集。',
        steps: ['大盒子 B = 全班同学', '小袋子 A = 女生同学', '女生 ⊆ 全班：每个女生都在班里'],
      },
    ],
    questions: [
      {
        question: '下列哪个是正确的子集关系？',
        options: ['{1} ⊂ {1, 2}', '{1} ⊃ {1, 2}', '{1, 2} ⊂ {1}', '∅ ⊂ {1}'],
        correct: '∅ ⊂ {1}',
        hint: '🧠 想一想：空集里什么都没有，是不是在任何一个集合里？',
        explanation: '空集是任何集合的子集，且是任何非空集合的真子集。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察图中的两个圆圈：哪个在外面，哪个在里面？', type: 'observe' },
      { step: 2, prompt: '🧠 如果 A = {1, 2}，B = {1, 2, 3, 4}，A ⊆ B 吗？为什么？', type: 'calculate' },
      { step: 3, prompt: '🧠 能否用一句话描述：什么是子集？', type: 'describe' },
      { step: 4, prompt: '子集和真子集有什么区别？', type: 'choose' },
    ],
  },

  mapping: {
    concept: 'mapping',
    conceptName: '映射',
    definition: '映射是从集合 A 到集合 B 的对应关系：A 中的每个元素都对应 B 中的唯一元素。',
    visualization: {
      type: 'arrow_mapping',
      title: '映射示意图',
      description: '箭头从 A 指向 B，每个 A 中的元素都有唯一的箭头',
      data: {
        setA: { name: 'A（定义域）', elements: ['1', '2', '3', '4'], cx: 100, cy: 150 },
        setB: { name: 'B（值域）', elements: ['2', '4', '6', '8'], cx: 300, cy: 150 },
        arrows: [
          { from: '1', to: '2', label: '×2' },
          { from: '2', to: '4', label: '×2' },
          { from: '3', to: '6', label: '×2' },
          { from: '4', to: '8', label: '×2' },
        ],
      },
    },
    analogies: [
      {
        title: '座位表',
        description: '映射就像教室的座位表：每个学号对应一个座位号。给了学号，就能唯一确定座位在哪里。',
        steps: ['定义域 A = 学号集合 {01, 02, 03}', '值域 B = 座位号 {A1, A2, A3}', '映射规则：学号 → 座位号'],
      },
    ],
    questions: [
      {
        question: '映射 f: x → 2x + 1，请问 f(3) = ？',
        options: ['6', '7', '5', '4'],
        correct: '7',
        hint: '🧠 想一想：f(x) = 2x + 1，把 x = 3 代入！',
        explanation: 'f(3) = 2×3 + 1 = 6 + 1 = 7。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察图中从 A 到 B 的箭头：每个 A 中的元素，指向几个 B 中的元素？', type: 'observe' },
      { step: 2, prompt: '🧠 如果 f(x) = 3x，输入 x = 4，输出 y 是多少？', type: 'calculate' },
      { step: 3, prompt: '🧠 映射和函数有什么关系？', type: 'describe' },
      { step: 4, prompt: '为什么映射中一个输入只能对应一个输出？', type: 'choose' },
    ],
  },

  quadratic: {
    concept: 'quadratic',
    conceptName: '二次函数',
    definition: '形如 y = ax² + bx + c（a ≠ 0）的函数叫二次函数，其图像是一条抛物线。',
    visualization: {
      type: 'function_curve',
      title: 'y = ax² + bx + c 图像族',
      description: '改变 a、b、c，观察图像如何变化',
      data: {
        variants: [
          { equation: 'y = x²', a: 1, b: 0, c: 0 },
          { equation: 'y = -x²', a: -1, b: 0, c: 0 },
          { equation: 'y = 2x²', a: 2, b: 0, c: 0 },
          { equation: 'y = x² + 2', a: 1, b: 0, c: 2 },
          { equation: 'y = (x-1)²', a: 1, b: -2, c: 1 },
        ],
        current: 0,
      },
    },
    analogies: [
      {
        title: '碗和帽子',
        description: '二次函数的图像像一口碗（a > 0）或一顶帽子（a < 0）。a 越大，碗口越小；a 越小，碗口越大。',
        steps: ['a > 0：开口向上，像一口碗', 'a < 0：开口向下，像一顶帽子', 'a 越大：碗口越窄', 'a 越小：碗口越宽'],
      },
    ],
    questions: [
      {
        question: 'y = 2x² 和 y = x² 相比，图像有什么变化？',
        options: ['更宽', '更窄', '向上平移', '向下平移'],
        correct: '更窄',
        hint: '🧠 想一想：a 变大了，图像会怎么变？试着画几个点比较一下',
        explanation: 'a = 2 > 1，图像在垂直方向被"拉长"了，所以看起来更窄。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察 y = x² 的图像，顶点在哪里？图像向哪个方向开口？', type: 'observe' },
      { step: 2, prompt: '🧠 如果把 a 改成 -1，图像会怎么变？', type: 'calculate' },
      { step: 3, prompt: '🧠 抛物线有几个对称轴？它们有什么特点？', type: 'describe' },
      { step: 4, prompt: '你能解释为什么 y = (x-1)² 的顶点在 x = 1 吗？', type: 'choose' },
    ],
  },

  monotonicity: {
    concept: 'monotonicity',
    conceptName: '单调性',
    definition: '若 x₁ < x₂ 时，f(x₁) < f(x₂)，则函数单调递增；若 f(x₁) > f(x₂)，则单调递减。',
    visualization: {
      type: 'function_curve',
      title: '单调递增 vs 单调递减',
      description: '观察曲线：上升还是下降？',
      data: {
        increasing: { equation: 'y = 2x + 1', points: [[-2, -3], [-1, -1], [0, 1], [1, 3], [2, 5]] },
        decreasing: { equation: 'y = -x + 3', points: [[-2, 5], [-1, 4], [0, 3], [1, 2], [2, 1]] },
      },
    },
    analogies: [
      {
        title: '爬山和下山',
        description: '单调递增就像爬山：x 越大（爬得越高），y 越大。单调递减就像下山：x 越大，y 越小。',
        steps: ['递增 = 爬山：越往右，爬得越高', '递减 = 下山：越往右，下得越低'],
      },
    ],
    questions: [
      {
        question: 'y = -3x + 5 是什么单调性？',
        options: ['单调递增', '单调递减', '先增后减', '先减后增'],
        correct: '单调递减',
        hint: '🧠 想一想：x 越来越大时，-3x 会怎么变化？',
        explanation: 'a = -3 < 0，所以是单调递减函数。x 越大，-3x 越小，y 也越小。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察递增函数的图像：从左往右看，曲线是上升还是下降？', type: 'observe' },
      { step: 2, prompt: '🧠 如果 x₁ = 1，x₂ = 3，f(x) = x²，f(x₁) 和 f(x₂) 谁大？', type: 'calculate' },
      { step: 3, prompt: '🧠 能否用生活中的例子说明"递增"和"递减"？', type: 'describe' },
      { step: 4, prompt: 'f(x) = x² 在 x > 0 时是什么单调性？在 x < 0 呢？', type: 'choose' },
    ],
  },

  parity: {
    concept: 'parity',
    conceptName: '奇偶性',
    definition: '偶函数：f(-x) = f(x)，图像关于 y 轴对称。奇函数：f(-x) = -f(x)，图像关于原点对称。',
    visualization: {
      type: 'symmetry',
      title: '对称性对比',
      description: '观察：关于 y 轴对称 vs 关于原点对称',
      data: {
        even: { equation: 'y = x²', label: '偶函数（y轴对称）', symmetry: 'y-axis' },
        odd: { equation: 'y = x³', label: '奇函数（原点对称）', symmetry: 'origin' },
      },
    },
    analogies: [
      {
        title: '镜子里的像',
        description: '偶函数关于 y 轴对称，就像你站在两面镜子中间，左右各有一个完全对称的像。奇函数关于原点对称，转动180度看起来一样。',
        steps: ['偶函数：f(-x) = f(x)，左右对称', '奇函数：f(-x) = -f(x)，绕原点转180度不变'],
      },
    ],
    questions: [
      {
        question: 'f(x) = x⁴ 是奇函数还是偶函数？',
        options: ['奇函数', '偶函数', '非奇非偶', '既是奇又是偶'],
        correct: '偶函数',
        hint: '🧠 想一想：(-x)⁴ = x⁴，所以 f(-x) = f(x) 吗？',
        explanation: 'f(-x) = (-x)⁴ = x⁴ = f(x)，所以是偶函数。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 观察 y = x² 的图像：关于哪条轴对称？', type: 'observe' },
      { step: 2, prompt: '🧠 计算 f(-2) 和 f(2)，它们相等吗？这个函数是奇是偶？', type: 'calculate' },
      { step: 3, prompt: '🧠 能否用自己的话说：什么是偶函数？', type: 'describe' },
      { step: 4, prompt: 'f(x) = x³ 是奇函数还是偶函数？', type: 'choose' },
    ],
  },

  limit: {
    concept: 'limit',
    conceptName: '极限',
    definition: '当 x 无限接近某个值 a 时，f(x) 无限接近常数 L，则称 f(x) 的极限为 L，记作 lim f(x) = L。',
    visualization: {
      type: 'function_curve',
      title: '极限的直观理解',
      description: '观察：x 越来越接近某个值时，y 越来越接近什么？',
      data: {
        limit_example: { equation: 'y = (x²-1)/(x-1)', limit_at: 1, limit_value: 2 },
      },
    },
    analogies: [
      {
        title: '追但永远追不上',
        description: '极限就像追乌龟：每次只能走剩余距离的一半，你离乌龟越来越近，但永远也追不上。你的位置"趋向于"乌龟的位置，但永远不等于。',
        steps: ['起点：你和乌龟相距1米', '你走0.5米，剩0.5米', '你再走0.25米，剩0.25米', '……永远在追，但极限值 = 乌龟的位置'],
      },
    ],
    questions: [
      {
        question: 'lim(x→2) (x²-4)/(x-2) = ?',
        options: ['0', '2', '4', '不存在'],
        correct: '4',
        hint: '🧠 想一想：x²-4 = (x-2)(x+2)，约分后是什么？',
        explanation: '(x²-4)/(x-2) = (x+2)(约去x-2)，当 x→2 时 = 4。',
      },
    ],
    guidedSteps: [
      { step: 1, prompt: '🧠 当 x 越来越接近 1 时，(x²-1)/(x-1) 的值越来越接近多少？', type: 'observe' },
      { step: 2, prompt: '🧠 用计算器试试：x = 0.9, 0.99, 0.999 时，结果分别是多少？', type: 'calculate' },
      { step: 3, prompt: '🧠 能否用"无限接近"来说明极限的含义？', type: 'describe' },
      { step: 4, prompt: '为什么极限不一定等于函数在该点的实际值？', type: 'choose' },
    ],
  },
};

const DEFAULT_CONCEPTS = ['function', 'set', 'subset', 'mapping', 'quadratic', 'monotonicity', 'parity', 'limit'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const concept = searchParams.get('concept') || 'function';
  const grade = (searchParams.get('grade') || 'grade1') as Grade;

  const viz = CONCEPT_VIZ_DB[concept] || CONCEPT_VIZ_DB['function'];

  return NextResponse.json({
    success: true,
    concept: viz.concept,
    data: viz,
    availableConcepts: DEFAULT_CONCEPTS,
  });
}
