export interface GeoGebraModelConfig {
  id: string;
  name: string;
  icon: string;
  category: 'solid' | 'function' | 'plane';
  appName: '3d' | 'graphing';
  commands: string[];
  defaultParams: Record<string, number>;
  formula: string;
  description: string;
  guideIntro: string;
  guideQuestions: string[];
}

export const GEO_MODELS: GeoGebraModelConfig[] = [
  {
    id: 'cube',
    name: '正方体',
    icon: '📦',
    category: 'solid',
    appName: '3d',
    commands: [
      'A=(0,0,0)',
      'B=(a,0,0)',
      'C=(a,a,0)',
      'D=(0,a,0)',
      'E=(0,0,a)',
      'F=(a,0,a)',
      'G=(a,a,a)',
      'H=(0,a,a)',
      'Segment(A,B)',
      'Segment(B,C)',
      'Segment(C,D)',
      'Segment(D,A)',
      'Segment(E,F)',
      'Segment(F,G)',
      'Segment(G,H)',
      'Segment(H,E)',
      'Segment(A,E)',
      'Segment(B,F)',
      'Segment(C,G)',
      'Segment(D,H)',
      'Polyhedron(A,B,C,D,E,F,G,H)',
    ],
    defaultParams: { a: 3 },
    formula: 'V = a³',
    description: '经典立体几何模型，可观察棱长、面对角线、体对角线。',
    guideIntro: '先观察这个正方体：你能数出它的顶点、棱和面各有多少个？',
    guideQuestions: [
      '正方体的棱长 a = ?',
      '正方体的体积公式是什么？',
      '如果 a = 3，体积是多少？',
    ],
  },
  {
    id: 'pyramid',
    name: '三棱锥',
    icon: '🔺',
    category: 'solid',
    appName: '3d',
    commands: [
      'A=(0,0,0)',
      'B=(a,0,0)',
      'C=(a/2,a*sqrt(3)/2,0)',
      'D=(a/2,a/(2*sqrt(3)),h)',
      'Segment(A,B)',
      'Segment(B,C)',
      'Segment(C,A)',
      'Segment(A,D)',
      'Segment(B,D)',
      'Segment(C,D)',
      'Polygon(A,B,C)',
      'SetVisibleInView(D,1,false)',
      'SetVisibleInView(Segment(A,D),1,false)',
      'SetVisibleInView(Segment(B,D),1,false)',
      'SetVisibleInView(Segment(C,D),1,false)',
    ],
    defaultParams: { a: 4, h: 4 },
    formula: 'V = 1/3 × 底面积 × 高',
    description: '观察三棱锥的底面、顶点与高的关系。',
    guideIntro: '观察这个三棱锥：底面是一个什么图形？顶点 D 到平面 ABC 的连线叫什么？',
    guideQuestions: [
      '底面三角形 ABC 的面积怎么算？',
      '三棱锥的体积和底面积有什么关系？',
      '高 h 变化时，体积怎样变化？',
    ],
  },
  {
    id: 'quadpyramid',
    name: '四棱锥',
    icon: '🔷',
    category: 'solid',
    appName: '3d',
    commands: [
      'B=(0,0,0)',
      'C=(a,0,0)',
      'D=(a,a,0)',
      'E=(0,a,0)',
      'A=(a/2,a/2,h)',
      'Segment(B,C)',
      'Segment(C,D)',
      'Segment(D,E)',
      'Segment(E,B)',
      'Segment(A,B)',
      'Segment(A,C)',
      'Segment(A,D)',
      'Segment(A,E)',
      'Polygon(B,C,D,E)',
    ],
    defaultParams: { a: 4, h: 5 },
    formula: 'V = 1/3 × 底面积 × 高',
    description: '以 BCDE 为底、A 为顶点的四棱锥，适合观察底面与各侧面的垂直关系。',
    guideIntro: '观察这个四棱锥：底面 BCDE 是什么图形？顶点 A 在底面的投影在哪里？',
    guideQuestions: [
      '侧面 ABCD 与底面 BCDE 的关系是什么？',
      '如何判断一条直线与平面垂直？',
      '若 AB ⟂ BCDE，那么侧面 ABCD 与底面有什么关系？',
      '按同样的方法，其他侧面与底面是否也垂直？',
      '综上，互相垂直的平面有几对？',
    ],
  },
  {
    id: 'cylinder',
    name: '圆柱',
    icon: '🥫',
    category: 'solid',
    appName: '3d',
    commands: [
      'A=(0,0,0)',
      'B=(a,0,0)',
      'C=(0,b,0)',
      'Circle(A,b)',
      'Extend(Conic)',
      'SetVisibleInView(A,1,false)',
      'SetVisibleInView(B,1,false)',
      'SetVisibleInView(C,1,false)',
    ],
    defaultParams: { a: 4, b: 2 },
    formula: 'V = πr²h',
    description: '调节半径与高度，理解圆柱体积公式。',
    guideIntro: '观察这个圆柱：当半径 r 或高 h 变化时，体积如何变化？',
    guideQuestions: [
      '圆柱的侧面展开是什么图形？',
      '体积公式里的 r 和 h 分别代表什么？',
      '把半径扩大 2 倍，体积会变成原来的几倍？',
    ],
  },
  {
    id: 'quadratic',
    name: '二次函数',
    icon: '📊',
    category: 'function',
    appName: 'graphing',
    commands: [
      'f(x)=a x^2 + b x + c',
      'A=(-3, f(-3))',
      'B=(3, f(3))',
    ],
    defaultParams: { a: 1, b: 0, c: 0 },
    formula: 'y = ax² + bx + c',
    description: '通过滑动条调节 a/b/c，观察抛物线变化。',
    guideIntro: '观察二次函数图像：参数 a、b、c 分别控制开口方向、对称轴位置和上下平移。',
    guideQuestions: [
      'a > 0 和 a < 0 时图像有什么不同？',
      '对称轴 x = -b/(2a) 是怎么来的？',
      'c 的变化如何影响图像？',
    ],
  },
  {
    id: 'trig',
    name: '三角函数',
    icon: '🌊',
    category: 'function',
    appName: 'graphing',
    commands: [
      'f(x)=A*sin(ω*x+φ)',
      'g(x)=A*cos(ω*x+φ)',
    ],
    defaultParams: { A: 1, omega: 1, phi: 0 },
    formula: 'y = A sin(ωx + φ)',
    description: '调节振幅、角频率和初相，观察周期变化。',
    guideIntro: '观察这个三角函数：A、ω、φ 分别决定振幅、周期和相位。',
    guideQuestions: [
      '振幅 A 变大，波形会怎样？',
      '周期 T 和 ω 有什么关系？',
      'φ 变化时图像如何平移？',
    ],
  },
];

export type ShapeTypeKey =
  | 'triangle'
  | 'quadrilateral'
  | 'pyramid'
  | 'quadpyramid'
  | 'cone'
  | 'cylinder'
  | 'sphere'
  | 'circle'
  | 'function'
  | 'solid'
  | '立体图形';

export const shapeTypeToModel: Record<ShapeTypeKey, string> = {
  triangle: 'pyramid',
  quadrilateral: 'quadpyramid',
  pyramid: 'pyramid',
  quadpyramid: 'quadpyramid',
  cone: 'pyramid',
  cylinder: 'cylinder',
  sphere: 'cylinder',
  circle: 'quadratic',
  function: 'quadratic',
  solid: 'cube',
  立体图形: 'cube',
};

export const DEFAULT_MODEL_ID = 'cube';

export function resolveModelIdFromShapeType(shapeType?: string): string {
  if (!shapeType) return DEFAULT_MODEL_ID;
  const normalized = shapeType.trim().toLowerCase();
  const key = normalized as ShapeTypeKey;
  if (key in shapeTypeToModel) {
    return shapeTypeToModel[key];
  }
  if (normalized.includes('四棱锥') || normalized.includes('四棱锥')) {
    return 'quadpyramid';
  }
  if (normalized.includes('三棱锥') || normalized.includes('锥')) {
    return 'pyramid';
  }
  if (normalized.includes('圆柱')) {
    return 'cylinder';
  }
  if (normalized.includes('正方体') || normalized.includes('立方体') || normalized.includes('长方体')) {
    return 'cube';
  }
  if (normalized.includes('函数') || normalized.includes('抛物线') || normalized.includes('二次')) {
    return 'quadratic';
  }
  if (normalized.includes('三角') || normalized.includes('三角形')) {
    return 'pyramid';
  }
  if (normalized.includes('四边') || normalized.includes('四边形')) {
    return 'quadpyramid';
  }
  if (normalized.includes('圆')) {
    return 'cylinder';
  }
  return DEFAULT_MODEL_ID;
}

export function resolveShapeLabel(shapeType?: string): string {
  if (!shapeType) return '几何图形';
  return shapeType;
}
