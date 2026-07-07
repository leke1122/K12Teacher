'use client';

import { useState } from 'react';

let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function loadPDFJS() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  return pdfjsLib;
}

export default function TestPDFPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('开始解析...\n');

    try {
      const pdfjs = await loadPDFJS();
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      setResult(prev => prev + '加载 PDF...\n');
      const loadingTask = pdfjs.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      
      setResult(prev => prev + `总页数: ${pdf.numPages}\n\n`);

      // 解析前10页
      const maxPages = Math.min(10, pdf.numPages);
      for (let i = 1; i <= maxPages; i++) {
        setResult(prev => prev + `\n===== 第 ${i} 页 =====\n`);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join('');
        
        setResult(prev => prev + pageText.substring(0, 500) + '\n');
      }

      setResult(prev => prev + '\n\n解析完成!');
    } catch (err) {
      setResult(prev => prev + `\n错误: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PDF 解析测试 (pdf.js)</h1>
      
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4" />
      
      {loading && <p className="text-blue-600">加载中...</p>}
      
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-[600px] whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
}
