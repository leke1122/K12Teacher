import * as pdfjsLib from 'pdfjs-dist';

// 设置 workerSrc 为空字符串
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

export interface PageContent {
  pageNumber: number;
  content: string;
}

export interface PDFParseResult {
  full_text: string;
  pages: PageContent[];
  totalPages: number;
}

/**
 * 使用 pdf.js 解析 PDF 文件
 * @param buffer PDF 文件的 Buffer 数据
 * @returns 解析结果
 */
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  const uint8Array = new Uint8Array(buffer);
  
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const pages: PageContent[] = [];
  let fullText = '';

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join('');

    pages.push({
      pageNumber: i,
      content: pageText
    });

    fullText += pageText + '\n';
  }

  return {
    full_text: fullText.trim(),
    pages,
    totalPages
  };
}
