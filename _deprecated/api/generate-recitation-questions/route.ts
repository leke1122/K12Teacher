import { NextResponse } from 'next/server';
import { RECITATION_POEMS, KeySentence } from '@/lib/recitation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const poemId = body?.poemId as string | undefined;
    const questionType = body?.questionType as 'context' | 'understanding' | 'typo' | undefined;
    const count = Math.min(Math.max(Number(body?.count ?? 6), 1), 20);

    const poems = poemId
      ? RECITATION_POEMS.filter((p) => p.id === poemId)
      : RECITATION_POEMS;

    const questions = generateQuestions({
      poems,
      type: questionType,
      count,
    });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('generate-recitation-questions error', error);
    return NextResponse.json({ success: false, message: '生成默写题失败' }, { status: 500 });
  }
}

type QuestionType = 'context' | 'understanding' | 'typo';

interface Question {
  id: string;
  poemId: string;
  poemTitle: string;
  type: QuestionType;
  typeLabel: string;
  prompt: string;
  answer: string;
  context: string;
  options?: string[];
  explanation: string;
  difficulty: 'simple' | 'medium' | 'hard';
}

function generateQuestions({
  poems,
  type,
  count,
}: {
  poems: typeof RECITATION_POEMS;
  type?: QuestionType;
  count: number;
}): Question[] {
  const questions: Question[] = [];
  const types: QuestionType[] = type ? [type] : ['context', 'understanding', 'typo'];

  const shuffledPoems = [...poems].sort(() => Math.random() - 0.5);

  for (const poem of shuffledPoems) {
    if (questions.length >= count) break;

    const sentencePool = poem.keySentences.filter((item) => Boolean(item.sentence && item.translation));
    if (!sentencePool.length) continue;

    const shuffledSentences = [...sentencePool].sort(() => Math.random() - 0.5);

    for (const item of shuffledSentences) {
      if (questions.length >= count) break;

      const selectedType = pickType(types, questions);

      if (selectedType === 'context') {
        const sentence = item.sentence;
        const masked = maskSentence(sentence);
        questions.push({
          id: `${poem.id}-context-${questions.length}`,
          poemId: poem.id,
          poemTitle: poem.title,
          type: 'context',
          typeLabel: '上下句填空',
          prompt: `请补全《${poem.title}》中的名句：${masked}`,
          answer: sentence,
          context: poem.title,
          explanation: item.translation,
          difficulty: 'simple',
        });
        continue;
      }

      if (selectedType === 'understanding') {
        const target = sentenceVariants(item, sentencePool);
        questions.push({
          id: `${poem.id}-understanding-${questions.length}`,
          poemId: poem.id,
          poemTitle: poem.title,
          type: 'understanding',
          typeLabel: '理解性默写',
          prompt: `根据提示，从《${poem.title}》中选择最合适的句子：${item.translation}`,
          answer: target.sentence,
          context: poem.title,
          options: generateOptions(target, sentencePool),
          explanation: item.translation,
          difficulty: 'medium',
        });
        continue;
      }

      if (selectedType === 'typo') {
        questions.push({
          id: `${poem.id}-typo-${questions.length}`,
          poemId: poem.id,
          poemTitle: poem.title,
          type: 'typo',
          typeLabel: '易错字专项',
          prompt: `请准确默写《${poem.title}》中的这句：${item.translation}`,
          answer: item.sentence,
          context: poem.title,
          explanation: item.translation,
          difficulty: 'hard',
        });
      }
    }
  }

  return questions.slice(0, count);
}

function pickType(types: QuestionType[], current: Question[]): QuestionType {
  const counts: Record<QuestionType, number> = { context: 0, understanding: 0, typo: 0 };
  for (const q of current) counts[q.type] += 1;

  let sorted = types
    .slice()
    .sort((a, b) => counts[a] - counts[b])
    .sort((a, b) => {
      if (a === 'context' && b === 'context') return 0;
      if (a === 'context') return -1;
      if (b === 'context') return 1;
      return 0;
    });

  return sorted[0] ?? types[0];
}

function maskSentence(sentence: string): string {
  const chars = [...sentence];
  const masked = chars.map((char, index) => {
    if (!/[一-龥]/.test(char)) return char;
    if (index === 0 || index === chars.length - 1) return char;
    if (Math.random() < 0.45) return '\\_';
    return char;
  });
  return masked.join('');
}

function sentenceVariants(item: KeySentence, sentencePool: KeySentence[]): KeySentence {
  if (Math.random() < 0.5 || sentencePool.length <= 1) return item;
  const others = sentencePool.filter((p) => p.sentence !== item.sentence);
  if (!others.length) return item;
  return others[Math.floor(Math.random() * others.length)];
}

function generateOptions(target: KeySentence, sentencePool: KeySentence[]): string[] {
  const options = [target.sentence];
  const all = sentencePool.map((p) => p.sentence).filter((s) => s !== target.sentence);
  const shuffled = all.sort(() => Math.random() - 0.5);
  for (const candidate of shuffled) {
    if (options.length >= 4) break;
    if (!options.includes(candidate)) options.push(candidate);
  }
  while (options.length < 4) {
    const fake = variantFakeAnswer(target.sentence);
    if (!options.includes(fake)) options.push(fake);
  }
  return options.sort(() => Math.random() - 0.5);
}

function variantFakeAnswer(sentence: string): string {
  const chars = [...sentence];
  if (!chars.length) return sentence;
  const targetIndex = Math.floor(Math.random() * chars.length);
  const randomChar = String.fromCharCode(
    0x4E00 + Math.floor(Math.random() * 1200)
  );
  chars[targetIndex] = randomChar;
  return chars.join('');
}
