/**
 * 函数知识图谱数据
 * 基于人教B版必修一、选择性必修三教材
 */

// 知识点分类
export type NodeCategory = 
  | '概念'      // 基础概念
  | '性质'      // 函数性质
  | '初等函数'  // 基本初等函数
  | '变换'      // 函数变换
  | '微积分';   // 导数相关

// 掌握度等级
export type MasteryLevel = 'not_started' | 'learning' | 'mastered';

// 知识图谱节点
export interface FunctionGraphNode {
  id: string;
  label: string;
  category: NodeCategory;
  prerequisites: string[];  // 前置知识点ID列表
  difficulty: 1 | 2 | 3;    // 1=基础, 2=中等, 3=困难
  description: string;       // 知识点简述
  keyPoints: string[];      // 关键考点
  formula?: string;          // 相关公式（可选）
}

// 知识图谱边
export interface FunctionGraphEdge {
  source: string;
  target: string;
  relation: 'prerequisite' | 'extension';  // 前置关系 / 拓展关系
}

// 知识点数据
export const functionGraphNodes: FunctionGraphNode[] = [
  // ========== 概念类 ==========
  {
    id: 'func-basic',
    label: '函数概念',
    category: '概念',
    prerequisites: [],
    difficulty: 1,
    description: '理解函数的定义，掌握函数的定义域、值域、对应关系',
    keyPoints: ['函数的三要素', '映射与函数的关系', '函数表示法'],
    formula: 'f: A → B',
  },
  {
    id: 'func-domain',
    label: '定义域',
    category: '概念',
    prerequisites: ['func-basic'],
    difficulty: 1,
    description: '求函数的定义域，掌握各类函数的定义域规则',
    keyPoints: ['分母不为零', '偶次根号内非负', '对数真数大于零', '指数底数正数且不等于1'],
    formula: 'D(f) = {x | y = f(x)有意义}',
  },
  {
    id: 'func-range',
    label: '值域',
    category: '概念',
    prerequisites: ['func-basic'],
    difficulty: 2,
    description: '求函数的值域，掌握不同类型函数值域的求法',
    keyPoints: ['配方法', '换元法', '图像法', '单调性法'],
  },
  
  // ========== 性质类 ==========
  {
    id: 'func-monotonicity',
    label: '单调性',
    category: '性质',
    prerequisites: ['func-basic'],
    difficulty: 1,
    description: '理解函数的单调性，会判断和证明函数的单调性',
    keyPoints: ['增函数定义', '减函数定义', '单调区间的表示', '复合函数单调性'],
    formula: 'x₁ < x₂ ⇒ f(x₁) < f(x₂) (增)',
  },
  {
    id: 'func-parity',
    label: '奇偶性',
    category: '性质',
    prerequisites: ['func-basic'],
    difficulty: 1,
    description: '理解奇函数和偶函数的定义，会判断函数的奇偶性',
    keyPoints: ['奇函数: f(-x) = -f(x)', '偶函数: f(-x) = f(x)', '定义域关于原点对称'],
    formula: '奇: f(-x) = -f(x)  偶: f(-x) = f(x)',
  },
  {
    id: 'func-periodicity',
    label: '周期性',
    category: '性质',
    prerequisites: ['func-basic'],
    difficulty: 2,
    description: '理解函数周期性的定义，会求函数的最小正周期',
    keyPoints: ['周期函数定义', '最小正周期', '常见周期函数'],
    formula: 'f(x+T) = f(x)',
  },
  {
    id: 'func-extreme',
    label: '函数极值',
    category: '性质',
    prerequisites: ['func-monotonicity'],
    difficulty: 2,
    description: '理解函数的极大值和极小值的概念',
    keyPoints: ['极大值与极小值定义', '极值点', '极值与最值的关系'],
  },
  {
    id: 'func-maxmin',
    label: '函数最值',
    category: '性质',
    prerequisites: ['func-extreme', 'func-monotonicity'],
    difficulty: 2,
    description: '求函数的最大值和最小值',
    keyPoints: ['配方法求最值', '单调性法求最值', '图像法求最值'],
  },
  
  // ========== 初等函数类 ==========
  {
    id: 'linear-function',
    label: '一次函数',
    category: '初等函数',
    prerequisites: ['func-basic', 'func-monotonicity'],
    difficulty: 1,
    description: '掌握一次函数的图像与性质',
    keyPoints: ['斜率与截距', '图像特征', 'k>0增, k<0减'],
    formula: 'y = kx + b (k ≠ 0)',
  },
  {
    id: 'quadratic-function',
    label: '二次函数',
    category: '初等函数',
    prerequisites: ['func-basic', 'func-monotonicity', 'func-extreme'],
    difficulty: 1,
    description: '掌握二次函数的图像、性质与应用',
    keyPoints: ['顶点坐标', '对称轴', '开口方向', '韦达定理'],
    formula: 'y = ax² + bx + c (a ≠ 0)',
  },
  {
    id: 'power-function',
    label: '幂函数',
    category: '初等函数',
    prerequisites: ['func-basic'],
    difficulty: 1,
    description: '掌握幂函数的定义、图像与性质',
    keyPoints: ['y = xⁿ 的图像特征', '指数对图像的影响', '过定点(1,1)'],
    formula: 'y = xⁿ (n为常数)',
  },
  {
    id: 'exp-function',
    label: '指数函数',
    category: '初等函数',
    prerequisites: ['func-basic', 'func-domain'],
    difficulty: 1,
    description: '掌握指数函数的定义、图像与性质',
    keyPoints: ['底数a>0且a≠1', '恒过点(0,1)', 'a>1增, 0<a<1减'],
    formula: 'y = aˣ (a>0, a≠1)',
  },
  {
    id: 'log-function',
    label: '对数函数',
    category: '初等函数',
    prerequisites: ['exp-function'],
    difficulty: 1,
    description: '掌握对数函数的定义、图像与性质',
    keyPoints: ['定义域x>0', '恒过点(1,0)', '与指数函数互为反函数'],
    formula: 'y = logₐx (a>0, a≠1)',
  },
  {
    id: 'trig-function',
    label: '三角函数',
    category: '初等函数',
    prerequisites: ['func-periodicity', 'func-basic'],
    difficulty: 2,
    description: '掌握正弦、余弦、正切函数的图像与性质',
    keyPoints: ['周期性', '单调区间', '最大值与最小值', '图像变换'],
    formula: 'y = sin x, cos x, tan x',
  },
  {
    id: 'inverse-trig',
    label: '反三角函数',
    category: '初等函数',
    prerequisites: ['trig-function'],
    difficulty: 3,
    description: '理解反三角函数的概念',
    keyPoints: ['arcsin的定义域与值域', 'arccos的定义域与值域', 'arctan的定义域与值域'],
    formula: 'y = arcsin x, arccos x, arctan x',
  },
  
  // ========== 变换类 ==========
  {
    id: 'func-transform',
    label: '函数图像变换',
    category: '变换',
    prerequisites: ['func-basic'],
    difficulty: 2,
    description: '掌握函数图像的平移、伸缩、对称变换',
    keyPoints: ['左加右减', '上加下减', '翻折变换', '伸缩变换'],
  },
  {
    id: 'func-composite',
    label: '复合函数',
    category: '变换',
    prerequisites: ['func-basic'],
    difficulty: 2,
    description: '理解复合函数的定义，会求复合函数的定义域和值域',
    keyPoints: ['复合函数定义', '定义域传递', '值域求解'],
  },
  
  // ========== 微积分类 ==========
  {
    id: 'derivative-concept',
    label: '导数概念',
    category: '微积分',
    prerequisites: ['func-limit', 'func-monotonicity'],
    difficulty: 2,
    description: '理解导数的定义，掌握导数的几何意义',
    keyPoints: ['导数定义', '导数的几何意义（切线斜率）', '可导与连续的关系'],
    formula: "f'(x) = lim(Δx→0) [f(x+Δx) - f(x)] / Δx",
  },
  {
    id: 'func-limit',
    label: '函数极限',
    category: '微积分',
    prerequisites: ['func-basic'],
    difficulty: 2,
    description: '理解函数极限的概念',
    keyPoints: ['极限定义', '极限运算法则', '两个重要极限'],
    formula: 'lim(x→x₀) f(x)',
  },
  {
    id: 'derivative-rules',
    label: '导数运算法则',
    category: '微积分',
    prerequisites: ['derivative-concept'],
    difficulty: 2,
    description: '掌握导数的加减乘除运算法则',
    keyPoints: ['和差积商求导法则', '复合函数求导法则'],
    formula: "(u±v)' = u' ± v'  (uv)' = u'v + uv'",
  },
  {
    id: 'derivative-application',
    label: '导数应用',
    category: '微积分',
    prerequisites: ['derivative-rules', 'func-extreme'],
    difficulty: 2,
    description: '用导数研究函数的单调性、极值和最值',
    keyPoints: ['导数判断单调性', '求极值的步骤', '实际最值问题'],
    formula: "f'(x)>0 ⇒ 增, f'(x)<0 ⇒ 减",
  },
];

// 知识图谱边关系
export const functionGraphEdges: FunctionGraphEdge[] = [
  // 函数概念 → 各性质
  { source: 'func-basic', target: 'func-domain', relation: 'prerequisite' },
  { source: 'func-basic', target: 'func-range', relation: 'prerequisite' },
  { source: 'func-basic', target: 'func-monotonicity', relation: 'prerequisite' },
  { source: 'func-basic', target: 'func-parity', relation: 'prerequisite' },
  { source: 'func-basic', target: 'func-periodicity', relation: 'prerequisite' },
  { source: 'func-basic', target: 'func-transform', relation: 'extension' },
  { source: 'func-basic', target: 'func-composite', relation: 'extension' },
  
  // 单调性相关
  { source: 'func-monotonicity', target: 'func-extreme', relation: 'prerequisite' },
  { source: 'func-extreme', target: 'func-maxmin', relation: 'prerequisite' },
  { source: 'func-monotonicity', target: 'linear-function', relation: 'prerequisite' },
  { source: 'func-monotonicity', target: 'quadratic-function', relation: 'prerequisite' },
  
  // 一次、二次函数
  { source: 'linear-function', target: 'quadratic-function', relation: 'extension' },
  
  // 幂函数、指数函数
  { source: 'func-basic', target: 'power-function', relation: 'prerequisite' },
  { source: 'func-domain', target: 'exp-function', relation: 'prerequisite' },
  { source: 'func-basic', target: 'exp-function', relation: 'prerequisite' },
  
  // 对数函数依赖指数函数
  { source: 'exp-function', target: 'log-function', relation: 'prerequisite' },
  
  // 周期性相关
  { source: 'func-periodicity', target: 'trig-function', relation: 'prerequisite' },
  { source: 'trig-function', target: 'inverse-trig', relation: 'extension' },
  
  // 变换相关
  { source: 'func-basic', target: 'func-transform', relation: 'prerequisite' },
  { source: 'func-basic', target: 'func-composite', relation: 'prerequisite' },
  
  // 极限与导数
  { source: 'func-basic', target: 'func-limit', relation: 'prerequisite' },
  { source: 'func-limit', target: 'derivative-concept', relation: 'prerequisite' },
  { source: 'func-monotonicity', target: 'derivative-concept', relation: 'prerequisite' },
  { source: 'derivative-concept', target: 'derivative-rules', relation: 'prerequisite' },
  { source: 'derivative-rules', target: 'derivative-application', relation: 'prerequisite' },
  { source: 'derivative-application', target: 'func-extreme', relation: 'extension' },
];

// 获取所有节点
export function getAllNodes(): FunctionGraphNode[] {
  return functionGraphNodes;
}

// 根据ID获取节点
export function getNodeById(nodeId: string): FunctionGraphNode | undefined {
  return functionGraphNodes.find(node => node.id === nodeId);
}

// 获取某节点的前置知识点
export function getPrerequisites(nodeId: string): FunctionGraphNode[] {
  const node = getNodeById(nodeId);
  if (!node) return [];
  return node.prerequisites
    .map(id => getNodeById(id))
    .filter((n): n is FunctionGraphNode => n !== undefined);
}

// 获取某节点的后继知识点
export function getNextNodes(nodeId: string): FunctionGraphNode[] {
  const edges = functionGraphEdges.filter(e => e.source === nodeId);
  return edges
    .map(e => getNodeById(e.target))
    .filter((n): n is FunctionGraphNode => n !== undefined);
}

// 获取某分类的所有节点
export function getNodesByCategory(category: NodeCategory): FunctionGraphNode[] {
  return functionGraphNodes.filter(node => node.category === category);
}

// 获取起点节点（无前置知识要求的节点）
export function getStartingNodes(): FunctionGraphNode[] {
  return functionGraphNodes.filter(node => node.prerequisites.length === 0);
}

// 根据难度获取节点
export function getNodesByDifficulty(difficulty: 1 | 2 | 3): FunctionGraphNode[] {
  return functionGraphNodes.filter(node => node.difficulty === difficulty);
}
