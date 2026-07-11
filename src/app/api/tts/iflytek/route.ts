import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

// 讯飞长文语音合成 API
const IFLYTEK_HOST = 'api-dx.xf-yun.com';
const IFLYTEK_CREATE_PATH = '/v1/private/dts_create';
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

// 创建讯飞 TTS 任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, speed, volume, pitch, appId, apiKey, apiSecret } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, message: '请提供要合成的文本' },
        { status: 400 }
      );
    }

    if (!appId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, message: '请提供完整的讯飞配置（APP ID、API Key、API Secret）' },
        { status: 400 }
      );
    }

    const date = new Date().toUTCString();
    const signature = generateIFlyTekSignature(IFLYTEK_HOST, date, 'POST', IFLYTEK_CREATE_PATH, apiSecret);
    
    const authorizationOrigin = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    const url = `https://${IFLYTEK_HOST}${IFLYTEK_CREATE_PATH}?host=${IFLYTEK_HOST}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          app_id: appId,
        },
        parameter: {
          dts: {
            vcn: voice || 'x5_lingfeizhe',
            speed: speed ?? 50,
            volume: volume ?? 50,
            pitch: pitch ?? 50,
            audio: {
              encoding: 'lame',
              sample_rate: 16000,
            },
            pybuf: {
              encoding: 'utf8',
              compress: 'raw',
              format: 'plain',
            },
          },
        },
        payload: {
          text: {
            encoding: 'utf8',
            compress: 'raw',
            format: 'plain',
            text: Buffer.from(text).toString('base64'),
          },
        },
      }),
    });

    const data = await response.json();
    console.log('[iflytek-create] code:', data.header?.code, 'task_id:', data.header?.task_id, 'message:', data.header?.message);

    if (data.header?.code === 0 && data.header?.task_id) {
      return NextResponse.json({
        success: true,
        taskId: data.header.task_id,
        message: '任务创建成功',
      });
    }

    return NextResponse.json(
      { success: false, message: data.header?.message || '任务创建失败' },
      { status: response.ok ? 500 : response.status }
    );
  } catch (error) {
    console.error('讯飞 TTS 创建任务失败:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '请求失败' },
      { status: 500 }
    );
  }
}
