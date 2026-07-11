import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

const IFLYTEK_HOST = 'api-dx.xf-yun.com';
const IFLYTEK_QUERY_PATH = '/v1/private/dts_query';

function generateIFlyTekSignature(host: string, date: string, path: string, apiSecret: string): string {
  const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
  return crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
}

// 查询讯飞 TTS 任务结果，服务端下载音频返回 base64
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, appId, apiKey, apiSecret } = body;

    if (!taskId || !appId || !apiKey || !apiSecret) {
      return NextResponse.json({ success: false, message: '参数不完整' }, { status: 400 });
    }

    console.log('[iflytek-query] taskId:', taskId, 'appId:', appId);

    // 1. 查询任务状态
    const date = new Date().toUTCString();
    const signature = generateIFlyTekSignature(IFLYTEK_HOST, date, IFLYTEK_QUERY_PATH, apiSecret);
    const authOrigin = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
    const authorization = Buffer.from(authOrigin).toString('base64');
    const queryUrl = `https://${IFLYTEK_HOST}${IFLYTEK_QUERY_PATH}?host=${IFLYTEK_HOST}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ header: { app_id: appId, task_id: taskId } }),
    });

    const data = await queryResponse.json();
    console.log('[iflytek-query] response:', JSON.stringify(data));

    // 讯飞 API 层面出错
    if (data.header?.code !== 0) {
      return NextResponse.json(
        { success: false, message: '讯飞 API 错误: ' + (data.header?.message || data.header?.code) },
        { status: 502 }
      );
    }

    // 任务失败（status=2）
    if (data.header?.task_status === 2) {
      return NextResponse.json(
        { success: false, message: '讯飞合成任务失败: ' + (data.header?.message || '未知错误') },
        { status: 500 }
      );
    }

    // 任务未完成（status=0 等待 或 1 运行中）
    if (data.header?.task_status !== 5 || !data.payload?.audio?.audio) {
      return NextResponse.json({
        success: true,
        status: String(data.header?.task_status || 'unknown'),
        message: '任务进行中',
      });
    }

    // 2. 任务完成，下载音频
    const audioDownloadUrl = Buffer.from(data.payload.audio.audio, 'base64').toString('utf8');

    const audioResponse = await fetch(audioDownloadUrl, {
      signal: AbortSignal.timeout(30000),
    });

    if (!audioResponse.ok) {
      return NextResponse.json(
        { success: false, message: '音频下载失败: ' + audioResponse.status },
        { status: 500 }
      );
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      status: 'completed',
      audioData: audioBase64,
      mimeType: 'audio/mpeg',
      message: '音频合成完成',
    });
  } catch (error) {
    console.error('讯飞 TTS 查询失败:', error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('fetch') || msg.includes('timeout') || msg.includes('network') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { success: false, message: 'Vercel 无法访问讯飞服务，请切换到浏览器语音' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: '讯飞查询异常: ' + msg },
      { status: 500 }
    );
  }
}
