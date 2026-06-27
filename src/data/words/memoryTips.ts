export function generateMemoryTip(word: string): string {
  const lower = word.toLowerCase().trim();
  
  // 常见词根/前缀/后缀检测
  const affixRules: [RegExp, string][] = [
    [/^(un|dis|re|pre|mis|over|under|out|sub|inter|trans|super|anti|semi|multi|auto|bio|geo|micro|macro|tele|photo|hydro|thermo)/i, '前缀'],
    [/(tion|sion|ment|ness|ity|ty|er|or|ist|ism|ship|age|ance|ence|dom|hood|ure|al|ial|ical|ous|ive|able|ible|ful|less|ly|ize|ise|fy|en|ed|ing|s|es|ies|est)$/i, '后缀'],
  ];

  for (const [regex, type] of affixRules) {
    const match = lower.match(regex);
    if (match) {
      const matched = match[0];
      const rest = lower.slice(matched.length);
      if (rest.length >= 2) {
        return `提示：${type} "${matched}"，剩余部分 "${rest}" 可联想记忆`;
      }
    }
  }

  // 音节拆分（简单启发式）
  const syllables = splitSyllables(lower);
  if (syllables.length >= 2) {
    return `音节拆分：${syllables.join(' · ')}，可分段记忆`;
  }

  // 谐音联想（简化版）
  const homophoneHints: Record<string, string> = {
    abandon: '啊，板凳！',
    ambitious: '俺必胜',
    appreciate: '俺普瑞溪ate（珍惜）',
    candidate: '看弟date（候选人）',
    decade: '弟克（十年）',
    deliberate: '低波瑞特（故意的）',
    eliminate: '伊莉咪呢特（消除）',
    guarantee: '瓜兰梯（保证）',
    harass: '哈瑞斯（骚扰）',
    immediate: '伊媒迪ate（立即）',
    jealous: '捷而乐斯（嫉妒）',
    knowledge: '诺利基（知识）',
    leisure: '雷泽尔（休闲）',
    miserable: '密岁波（痛苦的）',
    numerous: '弄缪拉斯（许多的）',
    occasion: '哦开申（场合）',
    peculiar: '配丘利尔（独特的）',
    quarantine: '宽特润（隔离）',
    resume: '瑞zu（简历）',
    schedule: '斯凯德朱（时间表）',
    tremendous: '川门德丝（巨大的）',
    vegetable: 'vedz台波（蔬菜）',
  };

  if (homophoneHints[lower]) {
    return `谐音联想：${homophoneHints[lower]}`;
  }

  return '尝试用词根或联想记忆';
}

function splitSyllables(word: string): string[] {
  if (word.length <= 3) return [word];
  
  const result: string[] = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    current += word[i];
    const remaining = word.length - i - 1;
    
    // 元音后分割
    if (remaining > 2 && /[aeiouy]/.test(word[i]) && !/[aeiouy]/.test(word[i + 1] || '')) {
      // 避免单音节
      if (current.length >= 2) {
        result.push(current);
        current = '';
      }
    }
  }
  
  if (current) {
    result.push(current);
  }
  
  // 确保至少有一个音节
  if (result.length === 0) {
    return [word];
  }
  
  return result;
}
