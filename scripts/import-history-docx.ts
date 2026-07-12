/**
 * 本地导入历史 docx 知识点脚本
 *
 * 用法：
 *   npx tsx scripts/import-history-docx.ts --unitId unit1 --file "第一单元知识点.txt"
 *   npx tsx scripts/import-history-docx.ts --unitId unit1 --text "粘贴的 docx 文本..."
 *
 * 说明：
 * - 通过调用 /api/history/knowledge/import-docx-text 完成导入
 * - 需要本地开发服务运行在 http://localhost:3000
 */

import http from 'http';

function postJson(url: string, payload: unknown) {
  return new Promise<{ ok: boolean; status: number; body: string }>((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(payload);
    const options = {
      hostname: u.hostname,
      port: u.port || '3000',
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ ok: res.statusCode ? res.statusCode < 400 : false, status: res.statusCode || 0, body: Buffer.concat(chunks).toString() }));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  let unitId = '';
  let text = '';
  let filePath = '';
  let apiBase = 'http://localhost:3000';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--unitId' && args[i + 1]) {
      unitId = String(args[++i]);
    } else if (arg === '--text' && args[i + 1]) {
      text = String(args[++i]);
    } else if (arg === '--file' && args[i + 1]) {
      filePath = String(args[++i]);
    } else if (arg === '--api' && args[i + 1]) {
      apiBase = String(args[++i]);
    }
  }

  if (!unitId) {
    console.error('缺少 --unitId');
    console.log('示例：npx tsx scripts/import-history-docx.ts --unitId unit1 --file "知识点.txt"');
    process.exit(1);
  }

  if (filePath) {
    try {
      text = require('fs').readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error('读取文件失败:', err);
      process.exit(1);
    }
  }

  if (!text) {
    console.error('缺少 docx 文本内容，请提供 --file 或 --text');
    process.exit(1);
  }

  console.log(`正在导入 unitId=${unitId}，文本长度=${text.length} ...`);
  const result = await postJson(`${apiBase}/api/history/knowledge/import-docx-text`, { unitId, docxText: text });
  console.log('状态码:', result.status);
  console.log('返回:', result.body);
}

main().catch((err) => {
  console.error('导入失败:', err);
  process.exit(1);
});
