// 高中数学人教B版（2019版）必修第一册 二级结论汇编
// 第一章 集合与常用逻辑用语、第二章 等式与不等式、第三章 函数

export interface SecondLevelConclusion {
  id: string;
  chapter: string;
  chapterName: string;
  title: string;
  conclusion: string;
  derivation: string;
  applicableConditions: string;
  typicalApplications: string;
  commonMistakes: string;
  examples?: string[];
  formulas?: string[];
}

export const mathSecondLevelConclusions: SecondLevelConclusion[] = [
  // ========== 第一章 集合与常用逻辑用语 ==========
  {
    id: '1.1',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.1 集合运算的摩根定律（De Morgan律）',
    conclusion: `设 U 为全集，A,B 为其子集，则：
- ∁U(A∪B) = ∁UA ∩ ∁UB
- ∁U(A∩B) = ∁UA ∪ ∁UB
口诀："交的补=补的并，并的补=补的交"，即"取补变号"`,
    derivation: `x ∈ ∁U(A∪B) ⟺ x ∉ A∪B ⟺ x ∉ A 且 x ∉ B ⟺ x ∈ ∁UA 且 x ∈ ∁UB ⟺ x ∈ ∁UA ∩ ∁UB`,
    applicableConditions: '必须在同一全集 U 下讨论',
    typicalApplications: '化简复杂的集合表达式。例如 ∁U[(A∩B)∪C] = (∁UA ∪ ∁UB) ∩ ∁UC。在解涉及"至少""至多"的否定问题时也常用。',
    commonMistakes: '摩根律只对"交、并"运算有效，对"差"运算需先转化（A\\B = A ∩ ∁UB）',
  },
  {
    id: '1.2',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.2 集合运算的分配律',
    conclusion: `A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)
A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)`,
    derivation: `x ∈ A ∩ (B ∪ C) ⟺ x ∈ A 且 x ∈ B ∪ C ⟺ x ∈ A 且（x ∈ B 或 x ∈ C）⟺ x ∈ A∩B 或 x ∈ A∩C`,
    applicableConditions: '任意集合均适用',
    typicalApplications: '化简集合表达式、求集合运算结果',
    commonMistakes: '集合的"并"对"交"也满足分配律，这一点与数乘对加法不同',
  },
  {
    id: '1.3',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.3 集合的包含关系与运算的等价转化',
    conclusion: `以下四个命题等价（A,B 为任意集合）：
A ⊆ B ⟺ A ∩ B = A ⟺ A ∪ B = B ⟺ ∁UB ⊆ ∁UA`,
    derivation: `A⊆B ⇒ A∩B=A：A 中元素都在 B 中，所以 A∩B 就是 A
∁UB⊆∁UA：B 外的元素一定是 A 外的元素的一部分`,
    applicableConditions: 'A,B 为任意集合',
    typicalApplications: '将"子集"条件转化为"运算结果"条件，是处理含参集合问题的核心工具',
    commonMistakes: '若 A=∅，则 A⊆B 恒成立，讨论子集关系时务必单独检验空集情形',
  },
  {
    id: '1.4',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.4 子集个数公式',
    conclusion: `若有限集 A 含有 n 个元素，则：
- A 的子集个数为 2^n
- A 的真子集个数为 2^n - 1
- A 的非空子集个数为 2^n - 1
- A 的非空真子集个数为 2^n - 2`,
    derivation: '构造子集时，A 中每个元素都有"取"或"不取"两种选择，n 个元素相互独立，故共 2×2×...×2 = 2^n 种',
    applicableConditions: '有限集',
    typicalApplications: '已知子集个数反推元素个数。若某集合有 16 个子集，则 2^n=16，n=4',
    commonMistakes: '注意区分"子集""真子集""非空子集""非空真子集"四种说法，差值不同',
  },
  {
    id: '1.5',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.5 容斥原理（集合计数）',
    conclusion: `对任意有限集 A₁,A₂,...,Aₙ：
|A₁∪A₂∪...∪Aₙ| = Σ|Aᵢ| - Σ|Aᵢ∩Aⱼ| + Σ|Aᵢ∩Aⱼ∩Aₖ| - ...

两个集合特例：|A∪B| = |A| + |B| - |A∩B|
三个集合特例：|A∪B∪C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|`,
    derivation: '直接相加时，同属于两个集合的元素被计算了两次，需减去一次；但同属于三个集合的元素需再加回',
    applicableConditions: '有限集',
    typicalApplications: '班级中会英语的30人、会日语的20人、两门都会的10人，则至少会一门的有 30+20-10=40 人',
    commonMistakes: '求"恰好会一门""恰好会两门"时需用文氏图逐区域计算，不能直接套公式',
  },
  {
    id: '1.6',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.6 差集与补集的转化',
    conclusion: 'A \\ B = A ∩ ∁UB（其中 B ⊆ U）',
    derivation: 'x ∈ A\\B ⟺ x ∈ A 且 x ∉ B ⟺ x ∈ A 且 x ∈ ∁UB',
    applicableConditions: 'B ⊆ U',
    typicalApplications: '将"差集"统一转化为"交、补"运算，便于使用摩根律、分配律化简',
    commonMistakes: '注意转化的前提条件',
  },
  {
    id: '1.7',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.7 集合相等的应用：元素互异性检验',
    conclusion: '若已知两个用列举法表示的集合相等，则它们的元素完全相同。解出参数后，必须检验元素互异性',
    derivation: '集合的相等基于"元素相同"，而集合元素具有互异性',
    applicableConditions: '用列举法表示的集合',
    typicalApplications: '设 A={1, a, a²}，B={1, a-1, a+1}，A=B。比较可得 a²=a+1，解得 a=(1±√5)/2，检验互异性后均成立',
    commonMistakes: '这是高考高频陷阱。凡涉及集合相等求参数，解出后必须检验互异性，常见舍根情形：a=0, a=1',
  },
  {
    id: '1.8',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.8 充分条件、必要条件与集合包含关系的对应',
    conclusion: `设命题 p 对应集合 P={x | p(x) 成立}，命题 q 对应集合 Q={x | q(x) 成立}，则：
p ⇒ q ⟺ P ⊆ Q
即：p 是 q 的充分条件 ⟺ P 是 Q 的子集`,
    derivation: 'p⇒q 意为"凡使 p 成立的 x 都使 q 成立"，即 P 中元素都在 Q 中，即 P⊆Q',
    applicableConditions: '任意命题',
    typicalApplications: '判断充要条件时，可将两个条件各自对应集合，比较包含关系',
    commonMistakes: '小范围 ⟹ 大范围。"小充分大必要"——子集对应的条件是充分条件，母集对应的条件是必要条件',
  },
  {
    id: '1.9',
    chapter: 'ch1',
    chapterName: '第一章 集合与常用逻辑用语',
    title: '1.9 命题的否定与全称/存在量词的转换',
    conclusion: `全称量词命题 ∀x∈M, p(x) 的否定为 ∃x₀∈M, ¬p(x₀)
存在量词命题 ∃x₀∈M, p(x₀) 的否定为 ∀x∈M, ¬p(x₀)
口诀："改量词，否结论"`,
    derivation: '全称命题要求"每一个都成立"，它的否定只需举出一个反例；存在命题要求"至少一个成立"，它的否定是"一个都不成立"',
    applicableConditions: '任意命题',
    typicalApplications: '写出"对所有实数 x，x²+1>0"的否定："存在实数 x₀，使 x₀²+1≤0"',
    commonMistakes: '否定命题时只否定结论，不否定前提条件；量词要改但范围 M 不变',
  },

  // ========== 第二章 等式与不等式 ==========
  {
    id: '2.1',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.1 不等式的基本性质',
    conclusion: `1. 对称性：a>b ⟺ b<a
2. 传递性：a>b, b>c ⇒ a>c
3. 可加性：a>b ⟺ a+c>b+c；同向可加：a>b, c>d ⇒ a+c>b+d
4. 可乘性：a>b, c>0 ⇒ ac>bc；a>b, c<0 ⇒ ac<bc（乘负数变号）
5. 同向同正可乘：a>b>0, c>d>0 ⇒ ac>bd
6. 乘方：a>b>0 ⇒ aⁿ>bⁿ
7. 开方：a>b>0 ⇒ ⁿ√a > ⁿ√b
8. 倒数：ab>0, a>b ⇒ 1/a < 1/b（同号取倒数变号）`,
    derivation: '以倒数性质为例：a>b, ab>0 ⇒ 1/a - 1/b = (b-a)/(ab)，因为 b-a<0 而 ab>0，所以 1/a < 1/b',
    applicableConditions: '每条性质对正负号有不同要求',
    typicalApplications: '比较 a/b 与 (a+c)/(b+c)（a,b,c>0）的大小',
    commonMistakes: '①不等式两边同乘负数必须变号；②同向不等式只能相加不能相减；③只有同向同正不等式才能相乘；④取倒数要求两边同号',
  },
  {
    id: '2.2',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.2 重要不等式 a²+b²≥2ab 及均值不等式',
    conclusion: `重要不等式：对任意 a,b∈ℝ，a²+b²≥2ab，当且仅当 a=b 时取等号
均值不等式（基本不等式）：当 a>0, b>0 时，(a+b)/2 ≥ √(ab)，当且仅当 a=b 时取等号

均值不等式的等价变形（a,b>0）：
- a+b ≥ 2√(ab)（和的形式）
- ab ≤ [(a+b)/2]²（积的形式）`,
    derivation: '重要不等式：(a-b)²≥0 展开即得 a²+b²≥2ab
均值不等式：以 √a, √b 替换 a,b，得 a+b≥2√(ab)',
    applicableConditions: '"一正、二定、三相等"——a,b 必须为正数；求和的最小值时积需为定值；等号能取到',
    typicalApplications: '积定求和最小：x>0, y>0, xy=4，则 x+y≥2√4=4，最小值 4
和定求积最大：x>0, y>0, x+y=6，则 xy≤(6/2)²=9，最大值 9',
    commonMistakes: '用均值不等式求最值时，若"积不是定值"或"和不是定值"，需先配凑；若等号取不到，则不能用均值不等式',
  },
  {
    id: '2.3',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.3 均值不等式的"1的代换"与配凑技巧',
    conclusion: `1. 乘"1"法：若已知 a/x + b/y = k（x,y,a,b>0），求 mx+ny 最小值
2. 拆项配凑法：如 x>3 时，x + 4/x = (x-3) + 4/(x-3) + 3 ≥ 2√4 + 3 = 7`,
    derivation: '核心思想是"凑定值"。乘"1"法利用条件式中和为定值的特点，将其作为"1"乘入目标式',
    applicableConditions: 'a,x,b,y 均为正数',
    typicalApplications: 'x>0, y>0, 2x+y=1，求 1/x + 1/y 最小值：= (1/x + 1/y)(2x+y) = 3 + y/x + 2x/y ≥ 3 + 2√2',
    commonMistakes: '乘"1"后展开的各项，使用均值不等式时各项等号条件必须一致',
  },
  {
    id: '2.4',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.4 一元二次方程的韦达定理',
    conclusion: `设 ax²+bx+c=0（a≠0）的两个实数根为 x₁,x₂，则：
x₁ + x₂ = -b/a
x₁x₂ = c/a`,
    derivation: '由求根公式 x₁₂ = (-b±√Δ)/(2a)，计算可得',
    applicableConditions: 'Δ=b²-4ac≥0（有实根），且 a≠0',
    typicalApplications: '已知 x₁,x₂ 是 x²-3x+1=0 的两根，求 x₁³+x₂³：x₁+x₂=3, x₁x₂=1，x₁³+x₂³=3³-3×1×3=18',
    commonMistakes: '使用韦达定理前必须先检验 Δ≥0，否则无实根，定理无意义',
  },
  {
    id: '2.5',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.5 "三个二次"联动',
    conclusion: `设 f(x)=ax²+bx+c（a>0），Δ=b²-4ac：
Δ>0：方程两不等实根，f(x)>0 解集 (-∞,x₁)∪(x₂,+∞)，f(x)<0 解集 (x₁,x₂)
Δ=0：方程两相等实根 x₀=-b/(2a)，f(x)>0 解集 (-∞,x₀)∪(x₀,+∞)，f(x)<0 解集 ∅
Δ<0：方程无实根，f(x)>0 解集 ℝ，f(x)<0 解集 ∅`,
    derivation: 'a>0 时抛物线开口向上。Δ>0 时与 x 轴交于两点，两根之间函数值为负',
    applicableConditions: 'a>0，若 a<0 先化为 a>0',
    typicalApplications: '解 x²-5x+6<0：Δ=25-24=1>0，x₁=2, x₂=3，解集 (2,3)',
    commonMistakes: '①ax²+bx+c>0 当 Δ=0 时解集要排除 x₀ 点；②含等号时要包含等根；③a=0 时退化为一次不等式',
  },
  {
    id: '2.6',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.6 一元二次不等式恒成立问题',
    conclusion: `f(x)>0 对一切 x∈ℝ 恒成立 ⟺ {a>0, Δ<0}
f(x)<0 对一切 x∈ℝ 恒成立 ⟺ {a<0, Δ<0}
f(x)>0 在区间 [m,n] 上恒成立 ⟺ 端点值≥0 且 Δ≤0（a>0）`,
    derivation: 'f(x)>0 在 ℝ 上恒成立，意味着抛物线开口向上（a>0）且与 x 轴无交点（Δ<0）',
    applicableConditions: '二次函数',
    typicalApplications: 'x²-ax+1>0 对一切 x∈ℝ 恒成立，求 a 范围。需 Δ=a²-4<0，即 -2<a<2',
    commonMistakes: '①不要遗漏 a>0（或 a<0）的条件；②区间上恒成立问题务必画图辅助',
  },
  {
    id: '2.7',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.7 "存在性"问题与恒成立问题的对比',
    conclusion: `∀x∈D, f(x)>a 恒成立 ⟺ f(x) 在 D 上最小值 > a
∀x∈D, f(x)<a 恒成立 ⟺ f(x) 在 D 上最大值 < a
∃x∈D, f(x)>a 能成立 ⟺ f(x) 在 D 上最大值 > a
∃x∈D, f(x)<a 能成立 ⟺ f(x) 在 D 上最小值 < a`,
    derivation: '恒成立要求"每一个都满足"，故看最不利情况；能成立只需"有一个满足"，故看最有利情况',
    applicableConditions: '任意函数',
    typicalApplications: '∃x∈[1,2], x²-ax+1<0 有解，求 a 范围',
    commonMistakes: '恒成立看"最值"，能成立也看"最值"，但取的是相反的最值，极易混淆',
  },
  {
    id: '2.8',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.8 分式不等式的同解变形',
    conclusion: `f(x)/g(x) > 0 ⟺ f(x)g(x) > 0
f(x)/g(x) < 0 ⟺ f(x)g(x) < 0
f(x)/g(x) ≥ 0 ⟺ {f(x)g(x) ≥ 0, g(x) ≠ 0}
f(x)/g(x) ≤ 0 ⟺ {f(x)g(x) ≤ 0, g(x) ≠ 0}`,
    derivation: '分式的符号取决于分子分母同号或异号，与两者乘积的符号一致',
    applicableConditions: '分母 g(x) ≠ 0',
    typicalApplications: '解 (x-1)/(x+2) ≤ 0：⇔ (x-1)(x+2) ≤ 0 且 x+2 ≠ 0 ⇔ x ∈ (-2, 1]',
    commonMistakes: '含等号的分式不等式，分母等于 0 的点必须排除',
  },
  {
    id: '2.9',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.9 绝对值不等式',
    conclusion: `|x| < a (a>0) ⟺ -a < x < a
|x| > a (a>0) ⟺ x < -a 或 x > a
|ax+b| < c (c>0) ⟺ -c < ax+b < c
|ax+b| > c (c>0) ⟺ ax+b < -c 或 ax+b > c

绝对值三角不等式：||a| - |b|| ≤ |a±b| ≤ |a| + |b|`,
    derivation: '|x|<a 表示数轴上 x 到原点距离小于 a，即 x∈(-a,a)',
    applicableConditions: 'a>0',
    typicalApplications: '解 |2x-1| < 3 ⇔ -3 < 2x-1 < 3 ⇔ -1 < x < 2',
    commonMistakes: '|x|<a 中 a 必须为正数，若 a≤0 则解集为空',
  },
  {
    id: '2.10',
    chapter: 'ch2',
    chapterName: '第二章 等式与不等式',
    title: '2.10 含参一元二次不等式"根的分布"结论',
    conclusion: `设 f(x)=ax²+bx+c（a>0），方程 f(x)=0 的两根为 x₁≤x₂：
(1) 两根都在区间 (m,n) 内 ⟺ {Δ≥0, m < -b/(2a) < n, f(m)>0, f(n)>0}
(2) 两根都大于 k ⟺ {Δ≥0, -b/(2a) > k, f(k)>0}
(3) 一根大于 k，一根小于 k ⟺ f(k)<0
(4) 两根都小于 k ⟺ {Δ≥0, -b/(2a) < k, f(k)>0}`,
    derivation: '这些结论都源于二次函数图象的特征——开口方向、对称轴位置、端点值符号、判别式共同决定根的位置',
    applicableConditions: '二次函数（a≠0）',
    typicalApplications: '方程 x²-(a-1)x+a-2=0 一根大于1，一根小于1，求 a',
    commonMistakes: '①每个结论都包含"判别式+对称轴+端点值"三个要素；②建议画图辅助判断',
  },

  // ========== 第三章 函数 ==========
  {
    id: '3.1',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.1 函数定义域的确定原则',
    conclusion: `求函数定义域需保证各部分有意义：
- 分式：分母 ≠ 0
- 偶次根式：被开方数 ≥ 0
- 零次幂 f(x)⁰：底数 f(x) ≠ 0
- 多个式子组合：取各部分定义域的交集

复合函数定义域：已知 f(x) 定义域为 D，则 f(g(x)) 中 g(x) ∈ D`,
    derivation: '各类型函数的定义域限制条件',
    applicableConditions: '基本初等函数及其复合',
    typicalApplications: 'f(x)=√(x-1)/(x-2) 定义域：x-1≥0 且 x-2≠0，即 [1,2)∪(2,+∞)',
    commonMistakes: '①y=f(x-1) 与 y=f(x) 是不同函数，定义域不同；②"定义域"始终指自变量 x 的取值范围',
  },
  {
    id: '3.2',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.2 函数单调性的等价定义与运算性质',
    conclusion: `(1) 单调性等价定义：
增函数 ⟺ (x₁-x₂)[f(x₁)-f(x₂)] > 0
减函数 ⟺ (x₁-x₂)[f(x₁)-f(x₂)] < 0

(2) 单调性运算性质：
- 增函数 + 增函数 = 增函数；减函数 + 减函数 = 减函数
- 增函数 - 减函数 = 增函数；减函数 - 增函数 = 减函数
- 若 f(x) 递增且 f(x)>0，则 1/f(x) 递减
- 复合函数"同增异减"`,
    derivation: '等价定义来源于单调性的定义：x₁<x₂ 时 f(x₁)<f(x₂)，即 x₁-x₂ 与 f(x₁)-f(x₂) 同号',
    applicableConditions: '在公共单调区间上',
    typicalApplications: '判断 f(x)=x+1/x 在 (1,+∞) 的单调性：增-减=增，故递增',
    commonMistakes: '①两个增函数相乘不一定是增函数；②复合函数单调性判断要确保内层函数值域在外层函数定义域内',
  },
  {
    id: '3.3',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.3 函数奇偶性的等价定义与判定',
    conclusion: `(1) 奇偶性定义：
偶函数：∀x∈D, -x∈D 且 f(-x)=f(x)
奇函数：∀x∈D, -x∈D 且 f(-x)=-f(x)

(2) 奇函数重要推论：若奇函数 f(x) 在 x=0 处有定义，则 f(0)=0

(3) 奇偶性运算：
- 奇 ± 奇 = 奇；偶 ± 偶 = 偶
- 奇 × 奇 = 偶；偶 × 偶 = 偶；奇 × 偶 = 奇`,
    derivation: '用定义验证，例如奇函数 f,g，则 (fg)(-x)=f(-x)g(-x)=[-f(x)][-g(x)]=f(x)g(x)=(fg)(x)',
    applicableConditions: '定义域 D 关于原点对称',
    typicalApplications: '判断 f(x)=x³-1/x 的奇偶性：奇-奇=奇',
    commonMistakes: '①y=x², x∈[-1,1) 不是偶函数，因定义域不关于原点对称；②f(0)=0 是奇函数的必要条件而非充分条件',
  },
  {
    id: '3.4',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.4 奇偶性与单调性的结合',
    conclusion: `奇函数在关于原点对称的两个区间 [a,b] 和 [-b,-a] 上具有相同的单调性
偶函数在关于原点对称的两个区间 [a,b] 和 [-b,-a] 上具有相反的单调性
口诀："奇同偶反"`,
    derivation: '设 f(x) 为奇函数，在 [a,b] 上递增。任取 x₁,x₂∈[-b,-a]，x₁<x₂，则 -x₁,-x₂∈[a,b] 且 -x₁>-x₂。因 f 在 [a,b] 递增，f(-x₁)>f(-x₂)，即 -f(x₁)>-f(x₂)，故 f(x₁)<f(x₂)',
    applicableConditions: '函数具有奇偶性',
    typicalApplications: '奇函数 f(x) 在 [0,+∞) 上递减，比较 f(-3) 与 f(-2) 大小：由"奇同"，f(-3)>f(-2)',
    commonMistakes: '①应用此结论前必须确认函数具有奇偶性；②比较大小问题中，若自变量分布在正负两侧，先用奇偶性"归到同一侧"再用单调性',
  },
  {
    id: '3.5',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.5 利用奇偶性求解析式',
    conclusion: `已知函数 f(x) 具有奇偶性，且已知 x>0 时的解析式：
偶函数：x<0 时，f(x)=f(-x)
奇函数：x<0 时，f(x)=-f(-x)
若奇函数在 x=0 有定义，则 f(0)=0`,
    derivation: '偶函数满足 f(x)=f(-x)，奇函数满足 f(x)=-f(-x)。当 x<0 时 -x>0，可代入已知的正半轴解析式',
    applicableConditions: '函数具有奇偶性',
    typicalApplications: 'f(x) 是 ℝ 上的奇函数，x>0 时 f(x)=x²+2x，则 f(x)={x²+2x, x>0; 0, x=0; -x²+2x, x<0}',
    commonMistakes: '①奇函数在 x=0 处若无定义则不能补 f(0)=0；②最终结果要写成完整分段函数形式',
  },
  {
    id: '3.6',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.6 函数图象的对称性',
    conclusion: `(1) 轴对称（关于直线 x=a）：
f(a+x)=f(a-x) ⟺ f(x) 图象关于直线 x=a 对称
等价形式：f(2a-x)=f(x)

(2) 中心对称（关于点 (a,b)）：
f(a+x)+f(a-x)=2b ⟺ f(x) 图象关于点 (a,b) 中心对称
等价形式：f(2a-x)=2b-f(x)`,
    derivation: '关于 x=a 对称意味着 (a+x) 与 (a-x) 这一对"关于 a 对称"的自变量对应同一函数值',
    applicableConditions: '任意函数',
    typicalApplications: '已知 f(2-x)=f(2+x) 对所有 x 成立，则 f(x) 图象关于直线 x=2 对称',
    commonMistakes: '判断对称性时，等式必须对定义域内所有 x 成立（恒等式）',
  },
  {
    id: '3.7',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.7 函数图象的变换法则',
    conclusion: `(1) 平移变换（"左加右减，上加下减"）：
- y=f(x+a)：a>0 左移 a
- y=f(x)+b：b>0 上移 b

(2) 对称变换：
- y=f(-x) 与 y=f(x) 关于 y 轴对称
- y=-f(x) 与 y=f(x) 关于 x 轴对称
- y=f(|x|)：保留 y 轴右侧，左侧替换为右侧关于 y 轴的对称
- y=|f(x)|：保留 x 轴上方，将 x 轴下方翻折上去

(3) 伸缩变换：
- y=f(ax)：横坐标缩短为原来 1/a
- y=af(x)：纵坐标伸长为原来 a 倍`,
    derivation: '以 y=f(x+a) 为例，要使 f(x+a)=f原(x₀)，需 x₀=x+a 即 x=x₀-a，说明新图象每点比原图象左移 a',
    applicableConditions: '任意函数',
    typicalApplications: '画 y=|x²-2x-3| 的图象',
    commonMistakes: '①y=f(x+a) 是水平变换（对 x 而言），方向与符号相反；②y=f(|x|) 与 y=|f(x)| 容易混淆',
  },
  {
    id: '3.8',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.8 函数的周期性',
    conclusion: `(1) 周期函数定义：存在非零常数 T，使 f(x+T)=f(x)，则 T 为一个周期

(2) 双对称推周期：
- 关于直线 x=a 和 x=b 对称 ⟹ T=2|b-a|
- 关于点 (a,0) 和 (b,0) 对称 ⟹ T=2|b-a|
- 关于直线 x=a 和点 (b,0) 对称 ⟹ T=4|b-a|

(3) 函数方程与周期：
- f(x+2)=-f(x) ⟹ T=4
- f(x+2)=1/f(x) ⟹ T=4`,
    derivation: '由对称性推导：f(a+x)=f(a-x) 且 f(b+x)=f(b-x)，可得 f(x)=f(x+2(b-a))',
    applicableConditions: '周期函数',
    typicalApplications: 'f(x+2)=f(2-x)（关于 x=2 对称）且 f(x+5)=f(5-x)（关于 x=5 对称），则 T=2|5-2|=6',
    commonMistakes: '"一轴一点"的周期是"两轴"或"两点"的两倍（4|b-a| 而非 2|b-a|）',
  },
  {
    id: '3.9',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.9 抽象函数的处理策略',
    conclusion: `(1) 赋值法：令自变量取特殊值（0、1、-1、x 与 -x 等），解出 f(0), f(1) 等关键值

(2) 常见抽象函数模型：
- f(x+y)=f(x)+f(y) ⟹ 正比例函数 f(x)=kx
- f(x+y)=f(x)f(y) ⟹ 指数型 f(x)=aˣ
- f(xy)=f(x)+f(y) ⟹ 对数型 f(x)=logₐx
- f(xy)=f(x)f(y) ⟹ 幂函数型 f(x)=xᶜ`,
    derivation: '赋值法的依据是函数方程对定义域内所有自变量成立，故可取特殊值',
    applicableConditions: '抽象函数（未给出具体解析式）',
    typicalApplications: 'f(x+y)=f(x)+f(y)，f(1)=2，求 f(0)：令 x=y=0 得 f(0)=0',
    commonMistakes: '抽象函数问题中，赋值要有目的性，不要盲目赋值',
  },
  {
    id: '3.10',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.10 二次函数在闭区间上的最值',
    conclusion: `设 f(x)=ax²+bx+c（a>0），在闭区间 [m,n] 上：
最小值：若对称轴 x₀=-b/(2a)∈[m,n]，则 fmin=f(x₀)；若 x₀<m，则 fmin=f(m)；若 x₀>n，则 fmin=f(n)
口诀："轴在区间内取顶点，轴在左取左端，轴在右取右端"

最大值：必在端点 m 或 n 处取得，"轴偏左最大在右端，轴偏右最大在左端"`,
    derivation: '开口向上的抛物线在顶点处取最小值。若顶点在区间左侧，函数在 [m,n] 上递增',
    applicableConditions: '二次函数在闭区间上',
    typicalApplications: 'f(x)=x²-2ax+1 在 [0,2] 上的最小值 g(a)：对称轴 x=a，分类讨论',
    commonMistakes: '分类讨论的边界要归属清楚；开口向下时最值结论相反',
  },
  {
    id: '3.11',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.11 函数零点与方程根的关系',
    conclusion: `(1) 零点定义：f(x)=0 的实数根称为函数 f(x) 的零点

(2) 零点存在性定理：若函数 y=f(x) 在 [a,b] 上连续，且 f(a)·f(b)<0，则函数在 (a,b) 内至少有一个零点

(3) 零点个数判定：
- f 在 [a,b] 上连续且 f(a)f(b)<0，且在 (a,b) 上单调，则有且仅有一个零点
- 二次函数：Δ>0 两零点，Δ=0 一个（重根），Δ<0 无零点`,
    derivation: '连续函数从 f(a)（正）变到 f(b)（负）（或反之），中间必经过 0，这是介值定理的体现',
    applicableConditions: '连续函数',
    typicalApplications: '求 f(x)=x³-2x-1 的零点个数：f(-1)=0，所以 x=-1 是零点，因式分解后共 3 个零点',
    commonMistakes: '①f(a)·f(b)<0 是"至少一个零点"的充分条件，不是必要条件；②必须保证函数在区间上连续',
  },
  {
    id: '3.12',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.12 二分法求零点近似值',
    conclusion: `操作步骤：
1. 确定区间 [a,b]，验证 f(a)f(b)<0
2. 取中点 c=(a+b)/2，计算 f(c)
3. 若 f(c)=0，c 即零点；若 f(a)·f(c)<0，令 b=c；否则令 a=c
4. 重复直到区间长度小于精度要求`,
    derivation: '每次区间长度减半，n 次后区间长度为 (b-a)/2ⁿ',
    applicableConditions: '连续函数且 f(a)f(b)<0',
    typicalApplications: '精度 0.1，初始区间长 1，需 n 次使 (1)/2ⁿ<0.1，即 n≥4',
    commonMistakes: '二分法只能求"变号零点"，不能求"不变号零点"',
  },
  {
    id: '3.13',
    chapter: 'ch3',
    chapterName: '第三章 函数',
    title: '3.13 函数值域的常用求法',
    conclusion: `| 方法 | 适用类型 |
| 观察法 | 简单函数 |
| 配方法 | 二次型函数 |
| 不等式法 | 涉及均值不等式 |
| 换元法 | 含根式、分式复合 |
| 单调性法 | 单调函数 |
| 分离常数法 | 分式型 |
| 判别式法 | 可化为 Ay²+By+C=0 型 |
| 数形结合 | 几何意义明显 |`,
    derivation: '不同方法适用于不同类型的函数',
    applicableConditions: '各种类型函数',
    typicalApplications: '分离常数法：y=(2x+1)/(x-1)=2+3/(x-1)，值域 (-∞,2)∪(2,+∞)
换元法：y=2x+√(x-1)，令 t=√(x-1)≥0，值域 [2,+∞)',
    commonMistakes: '换元法必须写出新元的取值范围；判别式法求出的值域端点要检验能否取到',
  },
];

// 按章节分组
export const groupedConclusions = {
  ch1: {
    name: '第一章 集合与常用逻辑用语',
    conclusions: mathSecondLevelConclusions.filter(c => c.chapter === 'ch1'),
  },
  ch2: {
    name: '第二章 等式与不等式',
    conclusions: mathSecondLevelConclusions.filter(c => c.chapter === 'ch2'),
  },
  ch3: {
    name: '第三章 函数',
    conclusions: mathSecondLevelConclusions.filter(c => c.chapter === 'ch3'),
  },
};
