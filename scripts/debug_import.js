const fs = require('fs');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

function extractTitleAuthor(headerLine) {
  const m = headerLine.match(/^##\s+(?:[一二三四五六七八九十百千\d]+[、．.\s]*)?(.+?)（(.+)）$/);
  if (m) return { title: m[1].trim(), author: m[2].trim() };
  const m2 = headerLine.match(/^##\s+(?:[一二三四五六七八九十百千\d]+[、．.\s]*)?(.+)$/);
  return { title: (m2 ? m2[1] : headerLine).trim(), author: '' };
}

function isBlockFormat(section) {
  return /###\s+(原文|全文翻译|重点字词注释|内容讲解|高考考点)(?:\s|$)/i.test(section);
}

const raw = fs.readFileSync(path.join(__dirname, 'classical-poems', '03-文言文选修12篇.md'), 'utf-8');
const sections = splitSections(raw);
console.log('sections=', sections.length);
sections.forEach((section, idx) => {
  const [headerLine] = section.split(/\r?\n/);
  const { title, author } = extractTitleAuthor(headerLine || '');
  const originalText = extractField(section, '原文').replace(/^\d+\.\s*/gm, '').trim();
  const translation = extractField(section, '全文翻译').trim();
  const contentAnalysis = extractField(section, '内容讲解').trim();
  console.log(idx + 1, ' | ', title, ' | ', author, ' | ', originalText.slice(0, 20), ' | ', translation.slice(0, 20), ' | ', contentAnalysis.slice(0, 20));
});
