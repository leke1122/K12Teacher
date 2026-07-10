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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitSections(raw) {
  const lines = raw.split(/\r?\n/);
  const sections = [];
  let current = [];

  for (const line of lines) {
    if (/^##\s+\d+\.\s+/.test(line)) {
      if (current.length) sections.push(current.join('\n').trim());
      current = [line];
      continue;
    }
    if (/^#\s+/.test(line) && !/^##\s+\d+\.\s+/.test(line)) {
      if (current.length) sections.push(current.join('\n').trim());
      current = [];
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
  const m = headerLine.match(/^##\s+\d+\.\s+(.+?)（(.+)）$/);
  if (m) return { title: m[1].trim(), author: m[2].trim() };
  const m2 = headerLine.match(/^##\s+\d+\.\s+(.+)$/);
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

async function run() {
  const all = [];

  for (const file of MD_FILES) {
    const absolute = path.join(__dirname, '..', '..', '..', '..', 'Desktop', '高中', '高中古诗文72篇', file);
    const raw = fs.readFileSync(absolute, 'utf-8');
    const category = file.startsWith('04') || file.startsWith('05') ? '诗词曲' : '文言文';
    const sections = splitSections(raw);

    for (const section of sections) {
      const [headerLine] = section.split(/\r?\n/);
      const { title, author } = extractTitleAuthor(headerLine || '');
      if (!title) continue;
      all.push({
        title,
        author,
        dynasty: '',
        category,
        book_name: file.replace('.md', ''),
        original_text: extractField(section, '原文').replace(/^\d+\.\s*/gm, '').trim(),
        translation: extractField(section, '全文翻译').trim(),
        annotations: parseAnnotations(section),
        content_analysis: extractField(section, '内容讲解').trim(),
        exam_points: parseList(section),
      });
    }
  }

  // Optional: clear existing data
  // await supabase.from('classical_poems').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('classical_poems').upsert(all, { onConflict: 'title' });
  if (error) {
    console.error('Import failed', error);
    process.exit(1);
  }
  console.log(`Imported ${all.length} poems`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
