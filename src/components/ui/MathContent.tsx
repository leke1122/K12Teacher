'use client';

import { useEffect, useRef, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathContentProps {
  content: string;
  className?: string;
}

export function MathContent({ content, className = '' }: MathContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  const macros = useMemo(() => ({
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\Q': '\\mathbb{Q}',
    '\\C': '\\mathbb{C}',
  }), []);

  useEffect(() => {
    if (!ref.current || !content) return;

    let html = content;

    // 处理块级公式 $$...$$（优先处理，避免与行内公式冲突）
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          throwOnError: false,
          displayMode: true,
          trust: true,
          macros,
        });
      } catch {
        return `$$${formula}$$`;
      }
    });

    // 处理行内公式 $...$
    // 用占位符保护已处理的块级公式内容
    html = html.replace(/\$([^$\n]+?)\$/g, (_, formula) => {
      // 跳过已经是 KaTeX 输出的内容（含有 class="katex"）
      if (formula.includes('katex')) return `$${formula}$`;
      try {
        return katex.renderToString(formula.trim(), {
          throwOnError: false,
          displayMode: false,
          trust: true,
          macros,
        });
      } catch {
        return `$${formula}$`;
      }
    });

    ref.current.innerHTML = html;
  }, [content, macros]);

  return <div ref={ref} className={className} />;
}
