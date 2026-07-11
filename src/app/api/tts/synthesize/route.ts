import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

// 讯飞配置
const IFLYTEK_HOST = 'api-dx.xf-yun.com';
const IFLYTEK_CREATE_PATH = '/v1/private/dts_create';
const IFLYTEK_QUERY_PATH = '/v1/private/dts_query';

// 阿里云配置
const ALIYUN_TTS_URL = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';

// 生成讯飞签名
function generateIFlyTekSignature(
  host: string,
  date: string,
  path: string,
  apiSecret: string
): string {
  const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');
}

// 生成阿里云签名
function generateAliyunSignature(
  accessKeySecret: string,
  path: string,
  params: Record<string, string>
): string {
  const sortedKeys = Object.keys(params).sort();
  let queryString = '';
  
  for (const key of sortedKeys) {
    if (queryString) queryString += '&';
    queryString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }

  const stringToSign = 'POST&' + encodeURIComponent(path) + '&' + encodeURIComponent(queryString);
  
  return crypto.createHmac('sha1', accessKeySecret + '&')
    .update(stringToSign)
    .digest('base64');
}

// 统一的 TTS 合成 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      provider,  // 'aliyun' | 'iflytek'
      // 讯飞配置
      iflytekAppId, 
      iflytekApiKey, 
      iflytekApiSecret,
      // 阿里云配置
      aliyunAccessKeyId, 
      aliyunAccessKeySecret, 
      aliyunAppKey,
      // 语音参数
      voice,
      speed = 50,
      volume = 50,
      pitch = 50,
    } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, message: '请提供要合成的文本' },
        { status: 400 }
      );
    }

    if (provider === 'iflytek') {
      // 讯飞长文语音合成
      if (!iflytekAppId || !iflytekApiKey || !iflytekApiSecret) {
        return NextResponse.json(
          { success: false, message: '请提供完整的讯飞配置' },
          { status: 400 }
        );
      }

      const date = new Date().toUTCString();
      const signature = generateIFlyTekSignature(IFLYTEK_HOST, date, IFLYTEK_CREATE_PATH, iflytekApiSecret);
      
      const authOrigin = `api_key="${iflytekApiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
      const authorization = Buffer.from(authOrigin).toString('base64');

      const url = `https://${IFLYTEK_HOST}${IFLYTEK_CREATE_PATH}?host=${IFLYTEK_HOST}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header: { app_id: iflytekAppId },
          parameter: {
            dts: {
              vcn: voice || 'x5_lingfeizhe',
              speed,
              volume,
              pitch,
              audio: { encoding: 'lame', sample_rate: 16000 },
              pybuf: { encoding: 'utf8', compress: 'raw', format: 'plain' },
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

      if (data.header?.code === 0 && data.header?.task_id) {
        return NextResponse.json({
          success: true,
          taskId: data.header.task_id,
          provider: 'iflytek',
          message: '任务创建成功',
        });
      }

      return NextResponse.json(
        { success: false, message: data.header?.message || '任务创建失败' },
        { status: 500 }
      );

    } else if (provider === 'aliyun') {
      // 阿里云 TTS
      if (!aliyunAccessKeyId || !aliyunAccessKeySecret || !aliyunAppKey) {
        return NextResponse.json(
          { success: false, message: '请提供完整的阿里云配置' },
          { status: 400 }
        );
      }

      const timestamp = new Date().toUTCString();
      const signatureNonce = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();

      const params: Record<string, string> = {
        AccessKeyId: aliyunAccessKeyId,
        AppKey: aliyunAppKey,
        Format: 'JSON',
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: signatureNonce,
        SignatureVersion: '1.0',
        Timestamp: timestamp,
      };

      const signature = generateAliyunSignature(aliyunAccessKeySecret, '/stream/v1/tts', params);
      params['Signature'] = signature;

      let queryString = '';
      for (const key of Object.keys(params).sort()) {
        if (queryString) queryString += '&';
        queryString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }

      // 计算 speech_rate 和 pitch_rate
      const speechRate = (speed - 50) * 2;
      const pitchRate = (pitch - 50) * 2;

      const response = await fetch(ALIYUN_TTS_URL + '?' + queryString, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appkey: aliyunAppKey,
          text,
          format: 'mp3',
          sample_rate: 16000,
          voice: voice || 'xiaoyun',
          volume: volume / 2,
          speech_rate: speechRate,
          pitch_rate: pitchRate,
        }),
      });

      if (response.headers.get('content-type')?.includes('audio') || response.headers.get('content-type')?.includes('mpeg')) {
        const audioBuffer = await response.arrayBuffer();
        
        return new NextResponse(Buffer.from(audioBuffer), {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(audioBuffer.byteLength),
          },
        });
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || '合成失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: '不支持的 TTS 提供商' },
      { status: 400 }
    );
  } catch (error) {
    console.error('TTS 合成失败:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '请求失败' },
      { status: 500 }
    );
  }
}
