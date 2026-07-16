/**
 * PDF 文本处理工具函数
 */

// 数学符号乱码修复映射表（PDF字体编码错误 → 正确符号）
// pdf-parse 在解析某些中文字体时，会把数学符号映射到错误的 Unicode 码点
// 注意：'元' → '∈' 映射已禁用，改由 protectAndFixElements 统一处理，避免"元素"被误转换为"∈∈素"
const MATH_SYMBOL_MAP: Record<string, string> = {
  // 用户指定补充映射（已移除 '元'：元→A 由 protectAndFixElements 统一处理）
  '犅': 'B',
  '犆': 'C',
  '犪': 'a',
  '犫': 'b',
  '犮': 'c',
  // 集合论符号（人民教育出版社 A031 Times New Roman 字体映射错误）
  '\u{e064}': '∅', // 乱码 → 空集
  '\u{e0b6}': '∉', // 乱码 → 不属于
  '\u{e0b7}': '∈', // 乱码 → 属于
  '\u{e0b8}': '⊆', // 乱码 → 包含于
  '\u{e0b9}': '⊂', // 乱码 → 真包含于
  '\u{e0ba}': '⊇', // 乱码 → 包含
  '\u{e0bb}': '⊃', // 乱码 → 真包含
  // ∈ 的另一种渲染方式（直接渲染成了汉字"元"，见高中数学教材）
  // 注意：此映射已禁用，改由 protectAndFixElements 统一处理
  // 原因：如果保留此映射，会把"元素"中的"元"也错误转成"∈"，产生"∈∈素"乱码
  // '元': '∈',
  // 运算符号
  '\u{e0a0}': '±',  // 加减号
  '\u{e0a1}': '×',  // 乘号
  '\u{e0a2}': '÷',  // 除号
  '\u{e0a3}': '∓',  // 减加号
  // 比较符号
  '\u{e0c0}': '≠',  // 不等于
  '\u{e0c1}': '≤',  // 小于等于
  '\u{e0c2}': '≥',  // 大于等于
  '\u{e0c3}': '≈',  // 约等于
  '\u{e0c4}': '≡',  // 恒等于
  '\u{e0c5}': '≢',  // 不恒等于
  '\u{e0c6}': '≌',  // 全等于
  '\u{e0c7}': '≅',  // 近似等于
  '\u{e0c8}': '∝',  // 成正比
  // 几何符号
  '\u{e0d0}': '∠',  // 角
  '\u{e0d1}': '°',  // 度
  '\u{e0d2}': '△',  // 三角形
  '\u{e0d3}': '⊥',  // 垂直
  '\u{e0d4}': '∥',  // 平行
  '\u{e0d5}': '⊙',  // 圆
  '\u{e0d6}': '⌒',  // 弧
  '\u{e0d7}': '⊕',  // 圆加
  // 常用数学符号
  '\u{e0e0}': '√',  // 根号
  '\u{e0e1}': 'π',  // 圆周率
  '\u{e0e2}': '∞',  // 无穷
  '\u{e0e3}': '∑',  // 求和
  '\u{e0e4}': '∏',  // 求积
  '\u{e0e5}': '∫',  // 积分
  '\u{e0e6}': '∬',  // 二重积分
  '\u{e0e7}': '∮',  // 曲线积分
  '\u{e0e8}': '∂',  // 偏导
  '\u{e0e9}': '∇',  // 梯度
  '\u{e0ea}': '∵',  // 因为
  '\u{e0eb}': '∴',  // 所以
  '\u{e0ec}': '∶',  // 比
  '\u{e0ed}': '÷',  // 除号（重复）
  '\u{e0ee}': '～',  // 波浪号
  '\u{e0ef}': '∽',  // 波浪
  // 根号常见误识别：槡
  '槡': '√',
  // 数字符号
  '\u{e000}': '０',  // 全角0
  '\u{e001}': '１',
  '\u{e002}': '２',
  '\u{e003}': '３',
  '\u{e004}': '４',
  '\u{e005}': '５',
  '\u{e006}': '６',
  '\u{e007}': '７',
  '\u{e008}': '８',
  '\u{e009}': '９',
  // 括号和分隔符
  '\u{e020}': '（',  // 左括号
  '\u{e021}': '）',  // 右括号
  '\u{e022}': '〔',  // 六角括号
  '\u{e023}': '〕',
  '\u{e024}': '【',  // 方头括号
  '\u{e025}': '】',
  '\u{e026}': '《',
  '\u{e027}': '》',
  // 数学符号（新发现）
  '\u{e011}': '|',   // 分隔符/竖线
  '\u{e05b}': '∈',  // 属于（另一种编码）
  // 下标数字（下标数字是 ∈ 的另一种渲染方式：₀=₁=₂=₃=∈）
  '\u{e4f3}': '∈',  // 下标0 → 属于
  '\u{e4f4}': '∈',  // 下标1 → 属于
  '\u{e4f5}': '∈',  // 下标2 → 属于
  '\u{e4f6}': '∈',  // 下标3 → 属于
  '\u{e4f7}': '∈',  // 下标4 → 属于
  '\u{e4f8}': '∈',  // 下标5 → 属于
  '\u{e4f9}': '∈',  // 下标6 → 属于
  '\u{e4fa}': '∈',  // 下标7 → 属于
  '\u{e4fb}': '∈',  // 下标8 → 属于
  // 真实的 Unicode 下标字符也是 ∈ 的渲染（₀=₁=₂=₃=∈）
  '₀': '∈', '₁': '∈', '₂': '∈', '₃': '∈', '₄': '∈',
  '₅': '∈', '₆': '∈', '₇': '∈', '₈': '∈', '₉': '∈',
  // 上标数字
  '\u{e7f2}': '²',  // 上标2（平方）
  '\u{e7f3}': '³',  // 上标3（立方）
  // 字母乱码（某些PDF字体把拉丁字母映射到汉字偏旁/部首区）
  // 大写字母
  '\u{41e5}': 'A',
  '\u{41e7}': 'B',
  '\u{41e8}': 'C',
  '\u{41e9}': 'D',
  '\u{41ea}': 'E',
  '\u{41eb}': 'F',
  '\u{41ec}': 'G',
  '\u{41ee}': 'I',
  '\u{41ef}': 'J',
  '\u{41f1}': 'K',
  '\u{41f2}': 'L',
  '\u{41f3}': 'M',
  '\u{41f4}': 'N',
  '\u{41f5}': 'O',
  '\u{41f6}': 'P',
  '\u{41f7}': 'Q',
  '\u{41f8}': 'R',
  '\u{41f9}': 'S',
  '\u{41fa}': 'T',
  '\u{41fb}': 'U',
  '\u{41fc}': 'V',
  '\u{41fe}': 'W',
  '\u{41ff}': 'X',
  '\u{41e6}': 'Y',
  '\u{4200}': 'Z',
  // 小写字母
  // 小写字母（使用正确的 Private Use Area 码点）
  '\u{41da}': 'a',
  '\u{41db}': 'b',
  '\u{41dc}': 'c',
  '\u{41dd}': 'd',
  '\u{41de}': 'e',
  '\u{41df}': 'f',
  '\u{41e0}': 'g',
  '\u{41e1}': 'h',
  '\u{41e2}': 'i',
  '\u{41e3}': 'j',
  '\u{41e4}': 'k',
  '\u{e0f0}': 'l',  // 小写l（专用码点）
  '\u{e0f1}': 'm',  // 小写m
  '\u{e0f2}': 'n',  // 小写n
  '\u{e0f3}': 'o',  // 小写o
  '\u{e0f4}': 'p',  // 小写p
  '\u{e0f5}': 'q',  // 小写q
  '\u{e0f6}': 'r',  // 小写r
  '\u{e0f7}': 's',  // 小写s
  '\u{e0f8}': 't',  // 小写t
  '\u{e0f9}': 'u',  // 小写u
  '\u{e0fa}': 'v',  // 小写v
  '\u{e0fb}': 'w',  // 小写w
  '\u{e0fc}': 'x',  // 小写x
  '\u{e0fd}': 'y',  // 小写y
  '\u{e0fe}': 'z',  // 小写z
  // 扩展字母映射（人民教育出版社数学教材特有的字体编码）
  // 大写希腊字母/特殊字体
  '\u{4E43}': 'A',  // 犃
  '\u{72D3}': 'x',   // 狓
  '\u{e100}': 'A',  // 额外的大写A
  '\u{e101}': 'B',  // 额外的大写B
  '\u{e102}': 'C',  // 额外的大写C
  '\u{e103}': 'D',  // 额外的大写D
  '\u{7B49}': '等',
  '\u{53EF}': '可',
  '\u{96C6}': '集',
  '\u{5408}': '合',
  '\u{5143}': '元',
  '\u{7D20}': '素',
  '\u{662F}': '是',
  '\u{5927}': '大',
  '\u{4E8E}': '于',
  '\u{6570}': '数',
  '\u{5373}': '即',
  '\u{7684}': '的',
  '\u{6216}': '或',
  '\u{FF5B}': '{',
  '\u{FF5C}': '|',
  '\u{FF5D}': '}',
  '\u{FF0C}': ',',
  '\u{FF1E}': ';',
  '\u{FF1D}': '=',
  '\u{72D7}': '独',
  '\u{7283}': '元',
  // 历史课本特有乱码（DOCX特殊字体映射错误）
  '犃': 'A',   // 大写A
  '犆': 'C',   // 大写C
  'CD': 'M',   // DOCX字体误渲染 → M（安史之乱）
  'CM': 'M',   // DOCX字体误渲染 → M
  'cd': 'M',   // DOCX字体误渲染 → 小写M
  'cM': 'M',   // DOCX字体误渲染 → M
  'CF': 'H',   // DOCX字体误渲染 → H
  'cF': 'H',   // DOCX字体误渲染 → H
  'D4': 'D',   // DOCX字体误渲染
  'D寸': 'D',  // DOCX字体误渲染
  'DM': 'M',   // DOCX字体误渲染
  // 数学教材常用汉字
  '\u{4EE5}': '以',
  '\u{628A}': '把',
  '\u{8868}': '表',
  '\u{793A}': '示',
  '\u{4E3A}': '为',
  // 更多可能的乱码映射
  '\u{5B57}': '字',
  '\u{6B63}': '正',
  '\u{786E}': '确',
  '\u{5B9A}': '定',
  '\u{6027}': '性',
  '\u{4E92}': '互',
  '\u{5F02}': '异',
  '\u{65E0}': '无',
  '\u{5E8F}': '序',
  // 数集相关
  '\u{81EA}': '自',
  '\u{7136}': '然',
  '\u{6574}': '整',
  '\u{6709}': '有',
  '\u{7406}': '理',
  '\u{5B9E}': '实',
  // 其他常见汉字
  '\u{4E14}': '且',
  '\u{4E0D}': '不',
  '\u{5C5E}': '属',
  // 省略号
  '\u{e030}': '……',  // 省略号（两个点）
  '\u{e031}': '⋯',    // 竖省略号
  // Unicode替换字符
  '\ufffd': '',  // Unicode替换字符
};

// 字体映射表（PDF字体编码错误 → 正确ASCII字符）
const FONT_MAPPING: Record<string, string> = {
  // 全角字母（优先映射，避免被当成普通中文处理）
  'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E',
  'Ｆ': 'F', 'Ｇ': 'G', 'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J',
  'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N', 'Ｏ': 'O',
  'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T',
  'Ｕ': 'U', 'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y',
  'Ｚ': 'Z',
  'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e',
  'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j',
  'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o',
  'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't',
  'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y',
  'ｚ': 'z',
  // 大写字母
  '犃': 'A', '犅': 'B', '犆': 'C', '犇': 'D', '犈': 'E',
  '犉': 'F', '犌': 'G', '犎': 'H', '犐': 'I', '犑': 'J',
  '犓': 'K', '犔': 'L', '犕': 'M', '犖': 'N', '犗': 'O',
  '犘': 'P', '犙': 'Q', '犚': 'R', '犛': 'S', '犜': 'T',
  '犝': 'U', '犞': 'V', '犠': 'W', '犡': 'X', '犢': 'Y',
  '犣': 'Z',
  // 小写字母
  '犪': 'a', '犫': 'b', '犮': 'c', '犱': 'd', '犲': 'e',
  '犳': 'f', '犵': 'g', '犺': 'h', '犻': 'i', '犼': 'j',
  '犽': 'k', '犾': 'l', '犿': 'm', '狀': 'n', '狅': 'o',
  '狆': 'p', '狇': 'q', '狉': 'r', '狊': 's', '狋': 't',
  '狌': 'u', '狏': 'v', '狑': 'w', '狓': 'x', '狔': 'y',
  '狕': 'z',
  // 数字
  '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
  '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  // 历史课本特有乱码（DOCX特殊字体映射错误）
  'CD': 'M',   // DOCX字体误渲染 → M（安史之乱）
  'CM': 'M',   // DOCX字体误渲染 → M
  'cd': 'M',   // DOCX字体误渲染 → 小写M
  'cM': 'M',   // DOCX字体误渲染 → M
  'CF': 'H',   // DOCX字体误渲染 → H
  'cF': 'H',   // DOCX字体误渲染 → H
  'D4': 'D',   // DOCX字体误渲染
  'DM': 'M',   // DOCX字体误渲染
};

/**
 * 临时保护文本中的字母和数字，防止后续清理/替换误删
 * 返回保护后的文本和还原函数
 */
export function protectAlphanumeric(text: string): { protectedText: string; restore: (t: string) => string } {
  if (!text) return { protectedText: '', restore: (t) => t };

  const placeholders: Array<{ type: 'num' | 'alpha'; ph: string; original: string }> = [];
  let index = 0;

  // 先保护数字，再保护字母，避免占位符本身被后续正则误伤
  const protectedText = text
    .replace(/[0-9]/g, (matched) => {
      const ph = `__NUM_${index}__`;
      placeholders[index] = { type: 'num', ph, original: matched };
      index++;
      return ph;
    })
    .replace(/[A-Za-z]/g, (matched) => {
      const ph = `__ALPHA_${index}__`;
      placeholders[index] = { type: 'alpha', ph, original: matched };
      index++;
      return ph;
    });

  const restore = (t: string): string => {
    let restored = t;
    for (let i = placeholders.length - 1; i >= 0; i--) {
      restored = restored.replace(placeholders[i].ph, placeholders[i].original);
    }
    return restored;
  };

  return { protectedText, restore };
}

/**
 * 清理PDF提取文本中的格式控制字符（无保护版本）
 * 内部使用，由公开 cleanPDFText 统一加上字母数字保护
 */
function cleanPDFTextUnprotected(text: string): string {
  if (!text) return '';

  // 1. 移除不可见控制字符（保留换行、回车、Tab，方便后续分段）
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. 仅移除常见 PDF 格式噪声，不触碰字母、数字和正文标点
  cleaned = cleaned.replace(/[!．"#\uFF01-\uFF0F]+/g, ' ');

  // 3. 压缩多余空白，但保留段落分隔
  cleaned = cleaned.replace(/[^\S\n]{2,}/g, ' ');

  return cleaned;
}

/**
 * 清理PDF提取文本中的格式控制字符（公开版本，带字母数字保护）
 * 只清理格式噪声，不触碰字母、数字和正文标点
 */
export function cleanPDFText(text: string): string {
  if (!text) return '';
  const { protectedText, restore } = protectAlphanumeric(text);
  return restore(cleanPDFTextUnprotected(protectedText));
}

/**
 * 修复PDF字体映射导致的字母乱码（犪→a, 犅→B 等）
 */
function fixFontMapping(text: string): string {
  if (!text) return text;

  let fixed = text;
  for (const [garbled, correct] of Object.entries(FONT_MAPPING)) {
    fixed = fixed.split(garbled).join(correct);
  }
  return fixed;
}

/**
 * 修复 PDF 解析后的数学符号乱码
 * 自动检测并替换所有已知的乱码模式
 */
export function fixMathSymbols(text: string): string {
  if (!text) return text;

  const originalLength = text.length;

  // 0. 先保护字母和数字，避免任何后续步骤误删
  const { protectedText, restore } = protectAlphanumeric(text);

  // 1. 预保护"元素"（必须在任何字符映射之前，防止'元→∈'破坏"元素"）
  let fixed = protectedText.replace(/元素/g, '\u200B元素\u200B');

  // 2. 先处理精确的字符映射（字体乱码 → 正确符号）
  for (const [garbled, correct] of Object.entries(MATH_SYMBOL_MAP)) {
    fixed = fixed.split(garbled).join(correct);
  }

  // 3. 处理常见的组合乱码模式（全角数字 + ∈/∉/⊆ 等联合输出）
  //   必须在全角→半角转换之前执行
  fixed = fixCombinedGarbledSymbols(fixed);

  // 4. 处理全角数字（放在组合乱码处理之后）
  fixed = fixFullWidthNumbers(fixed);

  // 5. 字体映射修复（犪→a, 犅→B 等）
  fixed = fixFontMapping(fixed);

  // 6. 精确后处理 —— 保护"元素"，只替换独立的集合符号"元"
  //   注意：此时"元素"已被步骤1保护（带\u200B），所以不会误伤
  fixed = protectAndFixElements(fixed);

  // 7. 还原字母和数字
  fixed = restore(fixed);

  // 8. 清理格式控制字符（此时已还原字母数字，不会误删）
  fixed = cleanPDFTextUnprotected(fixed);

  const finalLength = fixed.length;

  // 调试日志：检测长度异常变化
  if (Math.abs(finalLength - originalLength) > 10 || !fixed.match(/[A-Za-z]/)) {
    console.warn('[PDFUtils] fixMathSymbols 长度变化异常:', {
      originalLength,
      finalLength,
      hasLetters: !!fixed.match(/[A-Za-z]/),
      sample: fixed.slice(0, 200),
    });
  }

  return fixed;
}

/**
 * 上下文感知地修复元/元素问题：
 * - "元素" 整个词保留不变
 * - 单独的 "元"（表示集合符号）→ "A"
 * - PDF 误拆的 "元 素"（有空格）→ "元素"
 * - 误替换产生的 "A素" / "A 素" → "元素"
 */
function protectAndFixElements(text: string): string {
  let result = text;

  // 步骤1：保护"元素"
  result = result.replace(/元素/g, '\u200B元素\u200B');

  // 步骤2：修复 PDF 误拆产生的 "A素" / "A 素" / "A　素"
  result = result.replace(/A([\s　]+)素/g, '元素');
  result = result.replace(/A素/g, '元素');

  // 步骤3：精准替换集合符号"元" → "A"
  // (a) 独立符号元：元前后有分隔符/运算符 → 替换为 A
  const leftSep  = '([\\s　,，;。.!！？、…—–于\\(\\[∈∉⊆⊂⊇⊃∩∪])';
  const rightSep = '([\\s　,，;。.!！？、…—–\\)\\]∈∉⊆⊂⊇⊃∩∪]|$)';
  result = result.replace(new RegExp(leftSep + '元' + rightSep, 'g'), '$1A$2');
  // (a') 句首独立符号元
  result = result.replace(new RegExp('^元' + rightSep, 'g'), 'A$1');
  // (b) 元元相连：PDF把∈渲染成了元，两个元都要替换为A
  result = result.replace(/元元([。.!！？、…;，)）\]])?/g, 'AA$1');
  result = result.replace(/([(（\[{])元元/g, '$1AA');
  result = result.replace(/^元元/g, 'AA');
  // (c) ∈元 直接相连：∈ 后紧跟元（∈被渲染成元导致∈元相连）
  result = result.replace(/∈元/g, '∈A');

  // (d) 修复"∈∈素"乱码：∈∈素 是 MATH_SYMBOL_MAP 中 '元': '∈' 把"元素"的"元"错误转换后的产物
  result = result.replace(/∈∈素/g, '元素');
  // (d') 修复"∈素"乱码：单个 ∈ 紧跟素（∈是元被转换，素保留）
  result = result.replace(/∈素/g, '元素');

  // 步骤4：兜底还原——受保护的"元" + 空格/不可见 + "素" → "元素"
  result = result.replace(/(\u200B元)[\s　]+(素)/g, '$1$2');

  // 移除所有零宽空格
  result = result.replace(/\u200B/g, '');

  return result;
}

/**
 * 修复组合式乱码（连续的错误码点序列）
 */
function fixCombinedGarbledSymbols(text: string): string {
  // 数学表达式中常见的错误码点序列模式
  // 匹配形如 "０∉∅" 或 "１∈∅" 等全角数字+符号组合
  const combinedPatterns: [RegExp, string][] = [
    // 全角数字 + 元素关系符号
    [/０([∉∈⊆⊂⊇⊃])/gu, '０$1'],
    [/１([∉∈⊆⊂⊇⊃])/gu, '１$1'],
    [/２([∉∈⊆⊂⊇⊃])/gu, '２$1'],
    // 空集相关组合
    [/([０-９])[\u{e064}]/gu, '$1∅'],
    // 不属于/属于 连续出现的情况
    [/([０-９])[\u{e0b6}]([０-９])/gu, '$1∉$2'],
    [/([０-９])[\u{e0b7}]([０-９])/gu, '$1∈$2'],
    // 包含关系
    [/([０-９])[\u{e0b8}]([０-９])/gu, '$1⊆$2'],
    [/([０-９])[\u{e0b9}]([０-９])/gu, '$1⊂$2'],
  ];

  let result = text;
  for (const [pattern, replacement] of combinedPatterns) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 修复全角数字为半角（用于统一显示）
 */
function fixFullWidthNumbers(text: string): string {
  const fullWidthToHalfWidth: Record<string, string> = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  };

  let result = text;
  for (const [fw, hw] of Object.entries(fullWidthToHalfWidth)) {
    result = result.split(fw).join(hw);
  }

  return result;
}

/**
 * 检测文本中是否存在乱码（用于调试）
 */
export function detectGarbledSymbols(text: string): string[] {
  const detected: string[] = [];
  const garbledChars = new Set<string>();

  // 收集所有已知的乱码字符
  for (const garbled of Object.keys(MATH_SYMBOL_MAP)) {
    if (text.includes(garbled)) {
      garbledChars.add(garbled);
    }
  }

  // 检测 Private Use Area 字符（通常表示乱码）
  const priveUseRegex = /[\uE000-\uEFFF]/gu;
  let match;
  while ((match = priveUseRegex.exec(text)) !== null) {
    garbledChars.add(match[0]);
  }

  for (const char of garbledChars) {
    const correct = MATH_SYMBOL_MAP[char] || '?';
    detected.push(`"${char}" → "${correct}"`);
  }

  return detected;
}

export interface PageRange {
  type: 'printed' | 'file';
  start: number;
  end: number;
  fileStart?: number;
  fileEnd?: number;
}

export interface ChapterPages {
  chapterIndex: number;
  chapterTitle: string;
  pages: PageRange;
  sections?: {
    sectionIndex: string;
    sectionTitle: string;
    pages: PageRange;
    subSections?: {
      title: string;
      pages: PageRange;
    }[];
  }[];
}

export interface SectionPages {
  sectionIndex: string;
  sectionTitle: string;
  pages: PageRange;
}

export interface SubSectionPages {
  title: string;
  pages: PageRange;
}

/** 中文数字转阿拉伯数字 */
function cnToNumber(cn: string): number {
  const digits: Record<string, number> = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  cn = cn.replace(/十/g, '十');
  if (cn === '十') return 10;
  if (cn === '十零') return 10;
  let result = 0;
  let temp = 0;
  for (const ch of cn) {
    if (ch === '十') {
      temp = temp === 0 ? 10 : temp * 10;
      result += temp;
      temp = 0;
    } else if (ch === '万' || ch === '亿') {
      result = (result + temp) * (ch === '万' ? 10000 : 100000000);
      temp = 0;
    } else {
      temp = digits[ch] ?? 0;
    }
  }
  return result + temp;
}

/**
 * 从章节数据中解析实际的文件页码范围
 * 优先使用 fileStart/fileEnd（如果 type 为 printed 且存在映射）
 * 否则回退到 start/end
 */
export function resolvePageRange(pages: PageRange | undefined): { start: number; end: number } {
  if (!pages) {
    return { start: 1, end: 999 };
  }
  if (pages.type === 'printed' && Number.isFinite(pages.fileStart) && Number.isFinite(pages.fileEnd)) {
    return { start: pages.fileStart as number, end: pages.fileEnd as number };
  }
  return { start: pages.start, end: pages.end };
}

/**
 * 基于章节标题文本搜索，定位章节在全文中的内容范围
 */
export function findSectionContent(
  fullText: string,
  sectionTitle: string,
  nextSectionTitle?: string
): { content: string; startPos: number; endPos: number } | null {
  if (!fullText || !sectionTitle) return null;

  const startIndex = fullText.indexOf(sectionTitle);
  if (startIndex === -1) return null;

  let endIndex = fullText.length;
  if (nextSectionTitle) {
    const nextIndex = fullText.indexOf(nextSectionTitle, startIndex + sectionTitle.length);
    if (nextIndex !== -1) {
      endIndex = nextIndex;
    }
  }

  return {
    content: fixMathSymbols(fullText.substring(startIndex, endIndex)),
    startPos: startIndex,
    endPos: endIndex,
  };
}

/**
 * 从章节结构中推断当前章节的下一节标题
 */
export function findNextSectionTitle(
  chapters: ChapterPages[],
  chapterId: string | number,
  sectionId?: string,
  subSectionTitle?: string
): string | undefined {
  const chapterIndex = Number(chapterId);
  const chapter = chapters.find(ch => ch.chapterIndex === chapterIndex);
  if (!chapter) return undefined;

  const section = sectionId
    ? chapter.sections?.find(s => s.sectionIndex === sectionId)
    : undefined;
  if (!section) {
    const nextChapter = chapters.find(ch => ch.chapterIndex === chapterIndex + 1);
    return nextChapter?.chapterTitle;
  }

  const subSection = subSectionTitle
    ? section.subSections?.find(sub => sub.title === subSectionTitle)
    : undefined;

  if (subSection) {
    const currentIdx = section.subSections!.findIndex(sub => sub.title === subSectionTitle);
    const nextSub = section.subSections![currentIdx + 1];
    return nextSub?.title;
  }

  const currentIdx = chapter.sections!.findIndex(s => s.sectionIndex === sectionId);
  const nextSection = chapter.sections![currentIdx + 1];
  if (nextSection) return nextSection.sectionTitle || nextSection.sectionIndex;

  const nextChapter = chapters.find(ch => ch.chapterIndex === chapterIndex + 1);
  return nextChapter?.chapterTitle;
}

/**
 * 从章节数据中查找指定章节/小节的文件页码范围
 */
export function findSectionPageRange(
  chapters: ChapterPages[],
  chapterId: string | number,
  sectionId?: string,
  subSectionTitle?: string
): { start: number; end: number } {
  const chapterIndex = Number(chapterId);

  const chapter = chapters.find(ch => ch.chapterIndex === chapterIndex);
  if (!chapter) {
    return { start: 1, end: 999 };
  }

  if (!sectionId) {
    return resolvePageRange(chapter.pages);
  }

  const section = chapter.sections?.find(s => s.sectionIndex === sectionId);
  if (!section) {
    return resolvePageRange(chapter.pages);
  }

  if (subSectionTitle) {
    const subSection = section.subSections?.find(sub => sub.title === subSectionTitle);
    if (subSection) {
      return resolvePageRange(subSection.pages);
    }
  }

  return resolvePageRange(section.pages);
}

/**
 * 按页码范围从 PDF 文本中提取内容
 * 假设 PDF 文本中包含页码标记，格式如 "===== 第 X 页 =====" 或 "Page X"
 * 
 * @param fullText 完整的 PDF 文本
 * @param startPage 开始页码（1-based）
 * @param endPage 结束页码（1-based）
 * @returns 提取的内容
 */
export function extractContentByPageRange(
  fullText: string,
  startPage: number,
  endPage: number
): string {
  if (!fullText || startPage < 1 || endPage < startPage) {
    return '';
  }

  // 尝试多种页码标记格式
  const patterns = [
    /=====[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*=====/gu,  // "===== 第 1 页 ====="
    /=====[\s\u4e00-\u9fa5页\s]+(\d+)=====/gu,  // "===== 页 1 ====="
    /---[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*---/gu,  // "--- 第 1 页 ---"
    /第\s*(\d+)\s*页/gu,  // "第 1 页"
    /Page\s*(\d+)/gui,  // "Page 1" 或 "page 1"
    /\[\s*(\d+)\s*\]$/gum,  // 行尾的 "[1]"
  ];

  // 尝试找到页码位置
  for (const pattern of patterns) {
    const pages: Map<number, { start: number; end: number }> = new Map();
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(fullText)) !== null) {
      const pageNum = parseInt(match[1], 10);
      pages.set(pageNum, { start: match.index, end: 0 });
    }

    // 如果找到了足够的页码
    if (pages.size >= 2) {
      // 设置每个页码的结束位置
      const sortedPages = Array.from(pages.entries()).sort((a, b) => a[0] - b[0]);
      
      for (let i = 0; i < sortedPages.length; i++) {
        const [pageNum, pos] = sortedPages[i];
        if (i < sortedPages.length - 1) {
          const nextEntry = sortedPages[i + 1];
          pos.end = nextEntry[1].start;
        } else {
          pos.end = fullText.length;
        }
      }

      // 提取指定范围的内容
      let result = '';
      for (let i = startPage; i <= endPage; i++) {
        const pos = pages.get(i);
        if (pos) {
          result += fullText.slice(pos.start, pos.end) + '\n\n';
        }
      }

      if (result.trim().length > 100) {
        console.log(`[PDFUtils] 使用模式 "${pattern.source.slice(0, 30)}..." 提取到 ${result.length} 字符`);
        return fixMathSymbols(result.trim());
      }
    }
  }

  // 如果没有找到页码标记，尝试按字符数均分
  console.log('[PDFUtils] 未找到页码标记，尝试按字符数均分');
  return fixMathSymbols(extractByCharCount(fullText, startPage, endPage));
}

/**
 * 按字符数估算提取内容（当没有页码标记时）
 * 假设每页大约有固定字符数
 */
function extractByCharCount(
  fullText: string,
  startPage: number,
  endPage: number,
  estimatedCharsPerPage: number = 2000
): string {
  // 找到第一个数字开头的位置（假设是内容开始）
  const firstNumberMatch = fullText.match(/^[\s\S]*?(\d)[\d\u4e00-\u9fa5]/);
  const contentStart = firstNumberMatch ? firstNumberMatch.index! : 0;

  const startIndex = contentStart + (startPage - 1) * estimatedCharsPerPage;
  const endIndex = contentStart + endPage * estimatedCharsPerPage;

  return fullText.slice(Math.max(0, startIndex), Math.min(fullText.length, endIndex));
}

/**
 * 从 PDF 数据中提取指定页码范围的内容
 * 优先使用 pages 数组（如果可用）
 * 
 * @param pdfData 包含 full_text 和 pages 的 PDF 数据
 * @param startPage 开始页码（1-based）
 * @param endPage 结束页码（1-based）
 * @returns 提取的内容
 */
export function extractSectionContent(
  pdfData: { full_text?: string; fullText?: string; pages?: Array<{ pageNumber: number; content: string }> },
  startPage: number,
  endPage: number
): string {
  // 优先使用 pages 数组
  if (pdfData.pages && Array.isArray(pdfData.pages) && pdfData.pages.length > 0) {
    const filteredPages = pdfData.pages
      .filter(p => p.pageNumber >= startPage && p.pageNumber <= endPage)
      .sort((a, b) => a.pageNumber - b.pageNumber);
    
    if (filteredPages.length > 0) {
      const pageContents = filteredPages
        .map(p => `【第${p.pageNumber}页】\n${fixMathSymbols(p.content)}`)
        .join('\n\n');
      
      if (pageContents.length > 100) {
        console.log(`[PDFUtils] 从 pages 数组提取 ${pageContents.length} 字符，页数: ${filteredPages.length}, 范围: ${startPage}-${endPage}`);
        return pageContents;
      }
    }
  }

  // 回退到 full_text
  const fullText = pdfData.full_text || pdfData.fullText || '';
  if (!fullText) {
    return '';
  }

  return extractContentByPageRange(fullText, startPage, endPage);
}

/**
 * 检测 PDF 文本的页码格式
 */
export function detectPageFormat(fullText: string): string {
  const patterns = [
    { pattern: /=====[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*=====/, name: '===== 第 X 页 =====' },
    { pattern: /---[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*---/, name: '--- 第 X 页 ---' },
    { pattern: /第\s*(\d+)\s*页/, name: '第 X 页' },
    { pattern: /Page\s*(\d+)/gui, name: 'Page X' },
  ];

  for (const { pattern, name } of patterns) {
    if (pattern.test(fullText)) {
      return name;
    }
  }

  return '未知格式';
}

/**
 * 在文本边界处截断，移除下一章节的内容（通用方案，适用于所有学科、所有章节）
 * 
 * @param text 原始文本
 * @param currentSection 当前章节标识（如 "1.1.1"、"2.3.2"）
 * @returns 截断后的文本
 */
export function truncateAtSectionBoundary(text: string, currentSection?: string): string {
  if (!text || !currentSection) return text;

  // 解析当前章节号，构造下一章节的正则模式
  const nextSectionPattern = getNextSectionPattern(currentSection);
  if (!nextSectionPattern) return text;

  // 检查是否包含下一章节
  const match = nextSectionPattern.exec(text);
  if (!match || match.index < 100) return text;

  // 找到段落边界（在匹配点附近找最近段落结束）
  const truncateAt = findParagraphBoundary(text, match.index);
  
  if (truncateAt < text.length - 100) {
    console.log(`[PDFUtils] 章节 "${currentSection}" → 下一节 "${match[0]}" 在位置 ${match.index}，截断于段落边界 ${truncateAt}`);
    return text.substring(0, truncateAt);
  }

  return text;
}

/**
 * 根据当前章节号构造下一章节的正则模式
 * 支持：X.Y.Z、"第一章"、"第1节"、"1.1" 等格式
 * 例如："1.1.1" → /(?:1\.1\.2|1\.2\.1)/
 */
function getNextSectionPattern(sectionId: string): RegExp | null {
  const cleaned = sectionId.trim();
  const candidates: string[] = [];

  // X.Y.Z 格式（如 "1.1.1"）
  const threePart = cleaned.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (threePart) {
    const [, major, minor, patch] = threePart.map(Number);
    candidates.push(`${major}.${minor}.${patch + 1}`);
    candidates.push(`${major}.${minor + 1}.1`);
    candidates.push(`${major + 1}.1.1`);
  }

  // X.Y 格式（如 "1.2"）
  const twoPart = cleaned.match(/^(\d+)\.(\d+)$/);
  if (twoPart) {
    const [, major, minor] = twoPart.map(Number);
    candidates.push(`${major}.${minor + 1}`);
    candidates.push(`${major + 1}.1`);
  }

  // 中文章号格式（"第一章"、"第1章"）
  const cnChapter = cleaned.match(/^(?:第)?([零一二三四五六七八九十\d]+)章/);
  if (cnChapter) {
    const raw = cnChapter[1];
    const num = /\d/.test(raw) ? parseInt(raw, 10) : cnToNumber(raw);
    candidates.push(`${num + 1}`);
    candidates.push(`第${num + 1}章`);
  }

  // 阿拉伯数字章号（"第1章"）
  const arChapter = cleaned.match(/^(?:第)(\d+)章/);
  if (arChapter) {
    const num = parseInt(arChapter[1], 10);
    candidates.push(`${num + 1}`);
    candidates.push(`第${num + 1}章`);
  }

  const unique = candidates.filter(c => c !== cleaned && c !== sectionId);
  if (unique.length === 0) return null;

  const escaped = unique.map(escapeRegex);
  return new RegExp(`(?:${escaped.join('|')})`, 'g');
}

/**
 * 在给定位置附近找到最近的段落结束边界
 */
function findParagraphBoundary(text: string, nearIndex: number): number {
  // 在 nearIndex 前后各搜索 300 字符，找最近的段落结束（换行 + 空行）
  const searchStart = Math.max(0, nearIndex - 300);
  const searchEnd = Math.min(text.length, nearIndex + 300);
  const window = text.substring(searchStart, searchEnd);

  // 匹配段落分隔：两个连续换行（空行）或 标题标记
  const paragraphBreak = /\n\s*\n|---\s*\n|={3,}/;
  const match = paragraphBreak.exec(window);

  if (match) {
    return searchStart + match.index + match[0].length;
  }

  // 退而求其次：找最近的换行
  const newlineIdx = window.indexOf('\n');
  if (newlineIdx > 0) {
    return searchStart + newlineIdx + 1;
  }

  return nearIndex;
}

/** 转义正则特殊字符 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 验证提取的内容是否在指定章节范围内
 */
export function validateSectionBoundary(
  text: string,
  chapterTitle: string,
  currentSection?: string
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!text) {
    return { valid: false, warnings: ['内容为空'] };
  }

  // 动态检测下一章节内容
  const sectionId = currentSection || chapterTitle;
  const nextPattern = getNextSectionPattern(sectionId);
  if (nextPattern && nextPattern.test(text)) {
    warnings.push(`可能包含下一章节内容（检测到"${nextPattern.source}"）`);
  }

  return { valid: warnings.length === 0, warnings };
}

/**
 * 将课本还原文本拆分为独立段落，便于逐段展示
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];

  // 优先保留原文换行分段
  let paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 10);

  // 如果换行分段过少，则按句末标点+序号规则补分段
  if (paragraphs.length < 3) {
    const sentenceSplit = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split(/(?<=[。！？\n])/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    if (sentenceSplit.length >= 3) {
      paragraphs = sentenceSplit;
    }
  }

  // 若仍不足，再按常见序号切分
  if (paragraphs.length < 3) {
    const numberedSplit = text
      .split(/(?=[\(（]?\d+[\)）])/)
      .map(p => p.trim())
      .filter(p => p.length > 10);

    if (numberedSplit.length >= 3) {
      paragraphs = numberedSplit;
    }
  }

  // 兜底：按长度切分，尽量不在句中断开
  if (paragraphs.length < 2 && text.length > 300) {
    const chunks: string[] = [];
    let pos = 0;
    const chunkSize = 250;
    while (pos < text.length) {
      const end = Math.min(pos + chunkSize, text.length);
      let cut = text.lastIndexOf('。', end);
      if (cut <= pos) cut = text.lastIndexOf('，', end);
      if (cut <= pos) cut = end;
      chunks.push(text.substring(pos, cut + 1).trim());
      pos = cut + 1;
    }
    paragraphs = chunks.filter(p => p.length > 10);
  }

  return paragraphs;
}
