const testContent = \在生活与学习中,为了方便,我们经常要对事物进行分类 例如,图书馆中的书是按照所属学科等分类摆放的 如图1所示 ,作文学习可按照文体如记叙文、议论文等进行,整数可以分成正整数、负整数和零这三类……你能说出数学中其他分类实例吗？试着分析为什么要进行分类 在数学中,我们经常用 集合 来对所研究的对象进行分类 把一些能够确定的、不同的对象汇集在一起,就说由这些对象组成一个集合 有时简称为集 ,组成集合的每个对象都是这个集合的元素 集合通常用英文大写字母元,B,C,…表示,集合的元素通常用英文小写字母a,b,c,…表示 如果a是集合元的元素,就记作a∈元,读作 a属于元 ；如果a不是集合元的元素,就记作a∈元,读作 a不属于元 A(你能举出几个用集合表达的、与数学有关的例子吗？\;

function fixYuansuConfusion(text) {
  if (!text) return text;
  let result = text;
  result = result.replace(/元素/g, '\u200B元素\u200B');
  result = result.replace(/A([\s　]+)素/g, '元素');
  result = result.replace(/A素/g, '元素');
  result = result.replace(/([\s　,，;。.!！?？、…—–\(\[\{∈∉⊆⊂⊇⊃∩∪])元([\s　,，;。.!！?？、…—–\)\]\}∈∉⊆⊂⊇⊃∩∪]|\$)/g, '\\');
  result = result.replace(/^元([\s　,，;。.!！?？、…—–\)\]\}∈∉⊆⊂⊇⊃∩∪]|\$)/g, 'A\');
  result = result.replace(/^元\$/g, 'A');
  result = result.replace(/(\u200B元)[\s　]+(素)/g, '\\');
  result = result.replace(/\u200B/g, '');
  return result;
}

const fixed = fixYuansuConfusion(testContent);
console.log('=== 修复后 ===');
console.log(fixed);
console.log('');
console.log('=== 关键检测 ===');
const tests = [
  { label: '集合元的元素', expect: '集合A的元素', check: fixed.includes('集合A的元素') },
  { label: '∈元', expect: '∈A', check: fixed.includes('∈A') },
  { label: '元素 (保留)', expect: '元素', check: fixed.includes('元素') && !fixed.includes('A素') },
  { label: '属于元', expect: '属于A', check: fixed.includes('属于A') },
  { label: '不属于元', expect: '不属于A', check: fixed.includes('不属于A') },
  { label: '大写字母元,B,C', expect: '大写字母A,B,C', check: fixed.includes('大写字母A,B,C') },
];
for (const t of tests) {
  console.log((t.check ? '✅' : '❌') + ' ' + t.label + ' → ' + t.expect);
}