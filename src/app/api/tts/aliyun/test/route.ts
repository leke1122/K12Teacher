import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

// 阿里云语音合成 API
const ALIYUN_TTS_URL = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';

// 生成阿里云签名
function generateAliyunSignature(
  accessKeySecret: string,
  method: string,
  path: string,
  params: Record<string, string>
): string {
  // 按字母顺序排序参数
  const sortedKeys = Object.keys(params).sort();
  let canonicalizedQueryString = '';
  
  for (const key of sortedKeys) {
    if (canonicalizedQueryString) {
      canonicalizedQueryString += '&';
    }
    canonicalizedQueryString += 
      encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }

  const stringToSign = method + '&' + encodeURIComponent(path) + '&' + encodeURIComponent(canonicalizedQueryString);
  
  return crypto.createHmac('sha1', accessKeySecret + '&')
    .update(stringToSign)
    .digest('base64');
}

// 测试阿里云连接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessKeyId, accessKeySecret, appKey } = body;

    if (!accessKeyId || !accessKeySecret || !appKey) {
      return NextResponse.json(
        { success: false, message: '请提供完整的阿里云配置（AccessKey ID、AccessKey Secret、AppKey）' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toUTCString();
    const signatureNonce = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();
    const text = '阿里云语音合成测试';

    const params: Record<string, string> = {
      AccessKeyId: accessKeyId,
      AppKey: appKey,
      Format: 'JSON',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: signatureNonce,
      SignatureVersion: '1.0',
      Timestamp: timestamp,
    };

    const signature = generateAliyunSignature(accessKeySecret, 'POST', '/stream/v1/tts', params);
    params['Signature'] = signature;

    let queryString = '';
    for (const key of Object.keys(params).sort()) {
      if (queryString) queryString += '&';
      queryString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }

    const response = await fetch(ALIYUN_TTS_URL + '?' + queryString, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appkey: appKey,
        text: text,
        format: 'mp3',
        sample_rate: 16000,
        voice: 'xiaoyun',
      }),
    });

    const contentType = response.headers.get('content-type') || '';

    if (response.headers.get('content-type')?.includes('audio') || response.headers.get('content-type')?.includes('mpeg')) {
      return NextResponse.json({
        success: true,
        message: '阿里云语音合成连接成功！',
      });
    }

    const errorData = await response.json().catch(() => ({}));

    if (errorData.message?.includes('ACCESS_DENIED') || errorData.message?.includes('Missing authorization')) {
      return NextResponse.json(
        { success: false, message: 'AppKey 或权限问题。请确认：1) AppKey 来自语音合成服务控制台；2) 已开通语音合成服务；3) AccessKey 有语音服务权限。' },
        { status: 401 }
      );
    }

    if (errorData.message?.includes('InvalidAccessKeyId')) {
      return NextResponse.json(
        { success: false, message: 'AccessKey ID 无效' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: errorData.message || '请求失败' },
      { status: 500 }
    );
  } catch (error) {
    console.error('阿里云 TTS 测试失败:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '测试失败' },
      { status: 500 }
    );
  }
}
