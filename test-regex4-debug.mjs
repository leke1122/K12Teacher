const testContent = `在数学中,我们经常用 "集合"来对所研究的对象进行分类 把一些能够确定的、不同的对象汇集在一起,就说由这些对象组成一个集合 有时简称为集 ,组成集合的每个对象都是这个集合的元素 集合通常用英文大写字母元,B,C,…表示,集合的元素通常用英文小写字母a,b,c,…表示 如果a是集合元的元素,就记作a∈元,读作 "a属于元"；如果a不是集合元的元素,就记作a∈元,读作 "a不属于元" A(你能举出几个用集合表达的、与数学有关的例子吗？`;

console.log('=== 原始文本中的关键位置 ===');

// 找所有 ∈元 的位置
let s = testContent;
let offset = 0;
let pos;
while ((pos = s.indexOf('∈元')) !== -1) {
  const globalPos = offset + pos;
  console.log(`Found ∈元 at global pos ${globalPos}`);
  console.log(`  Context: ${JSON.stringify(s.slice(Math.max(0,pos-5), pos+10))}`);
  s = s.slice(pos + 1);
  offset += pos + 1;
}

// 找所有 元元 的位置
s = testContent;
offset = 0;
while ((pos = s.indexOf('元元')) !== -1) {
  const globalPos = offset + pos;
  console.log(`Found 元元 at global pos ${globalPos}`);
  console.log(`  Context: ${JSON.stringify(s.slice(Math.max(0,pos-5), pos+10))}`);
  s = s.slice(pos + 1);
  offset += pos + 1;
}

console.log('');
console.log('=== 逐步执行函数，观察每一步结果 ===');

// 手动逐步模拟
let r = testContent;
console.log('Step 0 (original):', JSON.stringify(r.slice(0, 200)));

// 步骤1：保护"元素"
r = r.replace(/元素/g, '\u200B元素\u200B');
console.log('Step 1 (保护元素):', JSON.stringify(r.slice(0, 200)));

// 步骤2：修复 "A素"
r = r.replace(/A([\s　]+)素/g, '元素');
r = r.replace(/A素/g, '元素');
console.log('Step 2 (修复A素):', JSON.stringify(r.slice(0, 200)));

// 步骤3a：有分隔符的元
const sym = '([\\s　,，;。.!！?？、…—–\\(\\)\\[\\]∈∉⊆⊂⊇⊃∩∪])';
r = r.replace(new RegExp(sym + '元'), '$1A');
r = r.replace(new RegExp('元' + sym), 'A$1');
console.log('Step 3a (sym元/sym):', JSON.stringify(r.slice(0, 200)));

// 步骤3b：元元
r = r.replace(/元元/g, 'AA');
r = r.replace(/元元([。.!！?？、…;，)）\]])/g, 'AA$1');
r = r.replace(/([。.!！?？、…;，)）\]])元元/g, '$1AA');
console.log('Step 3b (元元):', JSON.stringify(r.slice(0, 200)));

// 步骤3c：元的
r = r.replace(/([∈∉A])元的/g, '$1A的');
r = r.replace(/元的([。;!！?？、…,)）\]])/g, 'A的$1');
console.log('Step 3c (元的):', JSON.stringify(r.slice(0, 200)));

// 步骤4
r = r.replace(/(\u200B元)[\s　]+(素)/g, '$1$2');
console.log('Step 4 (兜底):', JSON.stringify(r.slice(0, 200)));

// 步骤5
r = r.replace(/\u200B/g, '');
console.log('Step 5 (最终):', JSON.stringify(r.slice(0, 200)));
