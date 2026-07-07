const testContent = `在数学中,我们经常用 "集合"来对所研究的对象进行分类 把一些能够确定的、不同的对象汇集在一起,就说由这些对象组成一个集合 有时简称为集 ,组成集合的每个对象都是这个集合的元素 集合通常用英文大写字母元,B,C,…表示,集合的元素通常用英文小写字母a,b,c,…表示 如果a是集合元的元素,就记作a∈元,读作 "a属于元"；如果a不是集合元的元素,就记作a∈元,读作 "a不属于元" A(你能举出几个用集合表达的、与数学有关的例子吗？`;

// ============================================================
// 精准方案 v5：解决两个替换相互干扰的问题
//
// 问题诊断：
// 原方案先用 sym元 → $1A，再用 元sym → A$1。
// 但 JavaScript replace() 非全局时只替换**第一个**匹配。
// 当 sym元 把 ∈元, 中的 ∈+元 替换后，∈ 被消耗了，
// 元sym 再搜 → 搜到的是 A元, 而非 ∈元, → 第二个元也没替换。
//
// 解决方案：把 (符号+元) 和 (元+符号) 合并到同一个正则，
// 用 | 分支同时匹配，用 ? 兼容可选的符号，让两个分支各自独立匹配。
// ============================================================

function fixYuansuConfusion(text) {
  if (!text) return text;
  let result = text;

  // 步骤1：保护"元素"——用零宽空格包裹
  result = result.replace(/元素/g, '\u200B元素\u200B');

  // 步骤2：修复被打散的"元素" → "A素" / "A 素" → "元素"
  result = result.replace(/A([\s　]+)素/g, '元素');
  result = result.replace(/A素/g, '元素');

  // 步骤3：精准替换独立的集合符号"元" → "A"
  //
  // 核心逻辑：
  // (a) 元前后有数学运算符或标点分隔 → 独立符号元 → 替换为 A
  //     例如：∈元、∈元、∉元、∉元、元,、元。、A(元)
  // (b) 两个元连在一起 → PDF把∈渲染成了元
  //     例如：元元、∈元元 → 前后两个元都要替换

  // 用一个正则同时处理 (前符号+元) 和 (元+后符号)
  // 关键：(?<=[符号])元 和 元(?=[符号]) 可以独立工作，不会相互消耗字符
  const symChars = '[,，;。.!！?？、…—–\\(\\)\\[\\]∈∉⊆⊂⊇⊃∩∪\\s　]';
  // 前缀元：符号后跟元（用后瞻 (?<=) 不消耗符号）
  result = result.replace(new RegExp(`(?<=${symChars})元`, 'g'), 'A');
  // 后缀元：元后跟符号（用前瞻 (?=) 不消耗符号）
  result = result.replace(new RegExp(`元(?=${symChars})`, 'g'), 'A');

  // (b) 两个元连在一起（∈元 → 元元 的情况）
  // 例如：元元、元元。、∉元元、元元) 等
  result = result.replace(/元元/g, 'AA');

  // 元元后有标点
  result = result.replace(/元元([。.!！?？、…;，)）\]])/g, 'AA$1');
  // 元元前有标点
  result = result.replace(/([。.!！?？、…;，)）\]])元元/g, '$1AA');

  // 元后跟"的"（∈元的 → ∈A的）
  result = result.replace(/([∈∉A])元的/g, '$1A的');
  result = result.replace(/元的([。;!！?？、…,)）\]])/g, 'A的$1');

  // 步骤4：兜底还原——受保护的"元" + 空格/不可见 + "素" → "元素"
  result = result.replace(/(\u200B元)[\s　]+(素)/g, '$1$2');

  // 步骤5：移除所有零宽空格
  result = result.replace(/\u200B/g, '');

  return result;
}

const fixed = fixYuansuConfusion(testContent);
console.log('=== 修复后 ===');
console.log(fixed);
console.log('');
console.log('=== 关键检测 ===');
const tests = [
  { label: '集合元的元素', expect: '集合A的元素' },
  { label: '∈元', expect: '∈A' },
  { label: '元素 (保留)', expect: '元素' },
  { label: '不属于元', expect: '不属于A' },
  { label: '大写字母元,B', expect: '大写字母A,B' },
  { label: '不属于元 (逗号)', expect: '不属于A' },
  { label: 'A( (结尾括号)', expect: 'A(' },
  { label: '元元', expect: 'AA' },
];
for (const t of tests) {
  const ok = fixed.includes(t.expect);
  console.log(`${ok ? '✅' : '❌'} ${t.label} → ${t.expect}`);
}
