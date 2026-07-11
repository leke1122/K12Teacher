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

    const queryData = await queryResponse.json();
    console.log('[iflytek-query] task_status:', queryData.header?.task_status, 'has_audio_url:', !!queryData.payload?.audio?.audio);

    // 查询结果交给上层判断，这里只返回原始数据或错误
    // 讯飞返回的 task_status 可能是字符串或数字
    const taskStatus = queryData.header?.task_status;
    const statusNum = typeof taskStatus === 'string' ? parseInt(taskStatus, 10) : taskStatus;

    // 错误状态码：2=失败 3=超时失败 4=音频合成失败
    if (statusNum === 2 || statusNum === 3 || statusNum === 4) {
      return NextResponse.json(
        { success: false, message: '讯飞任务失败: ' + (queryData.header?.message || queryData.header?.code) },
        { status: 502 }
      );
    }

    // 任务未完成（0=等待 1=运行中 5才算真正完成）
    if (statusNum !== 5 || !queryData.payload?.audio?.audio) {
      return NextResponse.json({
        success: true,
        status: String(taskStatus ?? 'unknown'),
        message: '任务进行中',
      });
    }

    // 2. 任务完成：直接返回讯飞的下载地址，让浏览器直连（绕过 Vercel 服务端下载限制）
    const rawUrl = Buffer.from(queryData.payload.audio.audio, 'base64').toString('utf8');
    const audioUrl = rawUrl.replace('http://', 'https://');
    console.log('[iflytek-query] task completed, audioUrl:', audioUrl);

    return NextResponse.json({
      success: true,
      status: 'completed',
      audioUrl,
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
