declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    text: string;
    info: Record<string, unknown>;
  }
  
  function pdfParse(data: Buffer | ArrayBuffer): Promise<PDFData>;
  
  export = pdfParse;
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  const pdfParse: (data: Buffer | ArrayBuffer) => Promise<{
    numpages: number;
    text: string;
    info: Record<string, unknown>;
  }>;
  export default pdfParse;
}
