import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

// 讯飞长文语音合成 API
const IFLYTEK_HOST = 'api-dx.xf-yun.com';
const IFLYTEK_QUERY_PATH = '/v1/private/dts_query';

// 生成讯飞签名
function generateIFlyTekSignature(
  host: string,
  date: string,
  method: string,
  path: string,
  apiSecret: string
): string {
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${method} ${path} HTTP/1.1`;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');
}

// 查询讯飞 TTS 任务结果
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, appId, apiKey, apiSecret } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: '请提供任务 ID' },
        { status: 400 }
      );
    }

    if (!appId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, message: '请提供完整的讯飞配置' },
        { status: 400 }
      );
    }

    const date = new Date().toUTCString();
    const signature = generateIFlyTekSignature(IFLYTEK_HOST, date, 'POST', IFLYTEK_QUERY_PATH, apiSecret);
    
    const authorizationOrigin = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    const url = `https://${IFLYTEK_HOST}${IFLYTEK_QUERY_PATH}?host=${IFLYTEK_HOST}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          app_id: appId,
          task_id: taskId,
        },
      }),
    });

    const data = await response.json();

    // 任务完成
    if (data.header?.task_status === 5 && data.payload?.audio?.audio) {
      const audioUrl = Buffer.from(data.payload.audio.audio, 'base64').toString('utf8');
      
      return NextResponse.json({
        success: true,
        status: 'completed',
        audioUrl,
        message: '音频合成完成',
      });
    }

    // 任务进行中
    if (data.header?.task_status) {
      return NextResponse.json({
        success: true,
        status: data.header.task_status,
        message: `任务状态: ${data.header.task_status}`,
      });
    }

    return NextResponse.json(
      { success: false, message: data.header?.message || '查询失败' },
      { status: 500 }
    );
  } catch (error) {
    console.error('讯飞 TTS 查询失败:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '请求失败' },
      { status: 500 }
    );
  }
}
