const testContent = `在数学中,我们经常用 "集合"来对所研究的对象进行分类 把一些能够确定的、不同的对象汇集在一起,就说由这些对象组成一个集合 有时简称为集 ,组成集合的每个对象都是这个集合的元素 集合通常用英文大写字母元,B,C,…表示,集合的元素通常用英文小写字母a,b,c,…表示 如果a是集合元的元素,就记作a∈元,读作 "a属于元"；如果a不是集合元的元素,就记作a∈元,读作 "a不属于元" A(你能举出几个用集合表达的、与数学有关的例子吗？`;

function fixYuansuConfusion(text) {
  if (!text) return text;
  let result = text;

  // 步骤1：保护"元素"
  result = result.replace(/元素/g, '\u200B元素\u200B');

  // 步骤2：修复被打散的"元素"
  result = result.replace(/A([\s　]+)素/g, '元素');
  result = result.replace(/A素/g, '元素');

  // 步骤3：
  const symChars = '[,，;。.!！?？、…—–\\(\\)\\[\\]∈∉⊆⊂⊇⊃∩∪\\s　]';
  
  console.log('Step 3 - prefix 元 regex:', `(?<=${symChars})元`);
  console.log('Step 3 - suffix 元 regex:', `元(?=${symChars})`);
  
  // 步骤3a：前缀元（符号后面的元）
  const prefix = new RegExp(`(?<=${symChars})元`, 'g');
  console.log('BEFORE prefix替换:', JSON.stringify(result));
  result = result.replace(prefix, 'A');
  console.log('AFTER prefix替换:', JSON.stringify(result));

  // 步骤3b：后缀元（元后面的符号）
  const suffix = new RegExp(`元(?=${symChars})`, 'g');
  console.log('BEFORE suffix替换:', JSON.stringify(result));
  result = result.replace(suffix, 'A');
  console.log('AFTER suffix替换:', JSON.stringify(result));

  // 步骤3c：元元
  console.log('元元 count:', (result.match(/元元/g) || []).length);
  result = result.replace(/元元/g, 'AA');
  result = result.replace(/元元([。.!！?？、…;，)）\]])/g, 'AA$1');
  result = result.replace(/([。.!！?？、…;，)）\]])元元/g, '$1AA');
  console.log('AFTER 元元替换:', JSON.stringify(result));

  // 步骤3d：元的
  console.log('∈元的 count:', (result.match(/[∈∉A]元的/g) || []).length);
  result = result.replace(/([∈∉A])元的/g, '$1A的');
  result = result.replace(/元的([。;!！?？、…,)）\]])/g, 'A的$1');
  console.log('AFTER 元的替换:', JSON.stringify(result));

  // 步骤4：兜底还原
  result = result.replace(/(\u200B元)[\s　]+(素)/g, '$1$2');

  // 步骤5：移除所有零宽空格
  result = result.replace(/\u200B/g, '');

  return result;
}

const fixed = fixYuansuConfusion(testContent);
console.log('');
console.log('=== 最终输出 ===');
console.log(fixed);
