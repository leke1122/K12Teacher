const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MD_FILES = [
  '01-文言文必修1-10篇.md',
  '02-文言文必修11-20篇.md',
  '03-文言文选修12篇.md',
  '04-诗词曲1-20.md',
  '05-诗词曲21-40.md',
];

const path = require('path');
const fs = require('fs');

function splitSections(raw) {
  const lines = raw.split(/\r?\n/);
  const sections = [];
  let current = [];

  const isSectionHeader = (line) => {
    if (/^##\s+\d+\.\s+/.test(line)) return true;
    if (/^##\s+[一二三四五六七八九十百千]+[、．.]?\s*/.test(line)) return true;
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

function parseAnnotations(raw) {
  const block = extractField(raw, '重点字词注释');
  const out = {};
  if (!block) return out;
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(.+?)[：:]\s*(.+)$/);
    if (!m) continue;
    const word = m[1].trim();
    const meaning = m[2].trim();
    if (word && meaning) out[word] = meaning;
  }
  return out;
}

function parseList(raw) {
  const block = extractField(raw, '高考考点');
  if (!block) return [];
  return block
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-•\d.)\s]+/, '').trim())
    .filter(Boolean);
}

function parseInlineField(text, field) {
  const regex = new RegExp(`${field}[：:]\\s*([^\\n]+)`);
  const match = text.match(regex);
  if (!match) return '';
  return match[1].trim();
}

function parseInlineAnnotations(text) {
  const block = parseInlineField(text, '注释');
  const out = {};
  if (!block) return out;
  for (const part of block.split(/[；;]/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(.+?)[：:]\s*(.+)$/);
    if (!m) continue;
    const word = m[1].trim();
    const meaning = m[2].trim();
    if (word && meaning) out[word] = meaning;
  }
  return out;
}

function parseInlineList(text) {
  const block = parseInlineField(text, '高考考点');
  if (!block) return [];
  return block
    .split(/[；;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isBlockFormat(section) {
  return /###\s+(原文|全文翻译|重点字词注释|内容讲解|高考考点)(?:\s|$)/i.test(section);
}

async function run() {
  const all = [];
  const sourceBase = path.join(__dirname, 'classical-poems');

  for (const file of MD_FILES) {
    const absolute = path.join(sourceBase, file);
    if (!fs.existsSync(absolute)) {
      console.warn(`Missing file: ${absolute}`);
      continue;
    }
    const raw = fs.readFileSync(absolute, 'utf-8');
    const category = file.startsWith('04') || file.startsWith('05') ? '诗词曲' : '文言文';
    const sections = splitSections(raw);
    const bookNameMap = {
      '01-文言文必修1-10篇.md': '必修上册',
      '02-文言文必修11-20篇.md': '必修下册',
      '03-文言文选修12篇.md': '选择性必修',
      '04-诗词曲1-20.md': '诗词曲1-20',
      '05-诗词曲21-40.md': '诗词曲21-40',
    };
    const bookName = bookNameMap[file] || file.replace('.md', '');

    for (const section of sections) {
      const [headerLine] = section.split(/\r?\n/);
      const { title, author } = extractTitleAuthor(headerLine || '');
      if (!title) continue;

      const isFileHeader =
        /^(必修|选择性必修|选修)\s*(\d|十|十二|选)/.test(title) ||
        /^诗词曲40首/.test(title);
      if (isFileHeader) continue;

      let originalText, translation, annotations, contentAnalysis, examPoints;

      if (isBlockFormat(section)) {
        originalText = extractField(section, '原文').replace(/^\d+\.\s*/gm, '').trim();
        translation = extractField(section, '全文翻译').trim();
        annotations = parseAnnotations(section);
        contentAnalysis = extractField(section, '内容讲解').trim();
        examPoints = parseList(section);
      } else {
        originalText = parseInlineField(section, '原文').trim();
        translation = parseInlineField(section, '翻译').trim();
        annotations = parseInlineAnnotations(section);
        contentAnalysis = parseInlineField(section, '讲解').trim();
        examPoints = parseInlineList(section);
      }

      if (!originalText && !translation && !contentAnalysis) {
        continue;
      }

      all.push({
        title,
        author,
        dynasty: '',
        category,
        book_name: bookName,
        original_text: originalText,
        translation: translation || null,
        annotations: Object.keys(annotations).length ? annotations : null,
        content_analysis: contentAnalysis || null,
        exam_points: examPoints.length ? examPoints : null,
      });
    }
  }

  console.log(`Prepared ${all.length} records.`);

  const { error: deleteError } = await supabase.from('classical_poems').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Clear failed', deleteError);
    process.exit(1);
  }

  const batchSize = 20;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const { error } = await supabase.from('classical_poems').insert(batch);
    if (error) {
      console.error(`Import batch ${Math.floor(i / batchSize) + 1} failed`, error);
      process.exit(1);
    }
    console.log(`Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
  }

  console.log(`Import completed: ${all.length} poems`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
