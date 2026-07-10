const fs = require('fs');
const path = require('path');

function splitSections(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = [];

  const isSectionHeader = (line) => {
    const trimmed = line.trimStart();
    if (/^##\s+\d+\.\s+/.test(trimmed)) return true;
    if (/^##\s+[一二三四五六七八九十百千]+[、．.]?\s*/.test(trimmed)) return true;
    return false;
  };

  for (const line of lines) {
    if (isSectionHeader(line)) {
      if (current.length) sections.push(current.join('\n').trim());
      current = [line];
      continue;
    }
    current.push(line);
  }
  if (current.length) sections.push(current.join('\n').trim());
  return sections.filter(Boolean);
}

function extractField(block, heading) {
  const regex = new RegExp(`###\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n###\\s+|\\Z)`, 'i');
  const match = block.match(regex);
  if (!match) return '';
  return match[1].trim();
}

const raw = fs.readFileSync(path.join(__dirname, 'classical-poems', '03-文言文选修12篇.md'), 'utf-8');
const sections = splitSections(raw);
console.log('sections', sections.length);
for (const section of sections) {
  console.log('---SECTION---');
  console.log(section.slice(0, 400));
  console.log('originalText:', extractField(section, '原文').slice(0, 80));
  console.log('translation:', extractField(section, '全文翻译').slice(0, 80));
  console.log('contentAnalysis:', extractField(section, '内容讲解').slice(0, 80));
}
