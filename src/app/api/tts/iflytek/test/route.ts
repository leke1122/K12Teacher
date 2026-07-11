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
  path: string,
  apiSecret: string
): string {
  const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');
}

// 测试讯飞连接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, apiKey, apiSecret } = body;

    if (!appId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, message: '请提供完整的讯飞配置（APP ID、API Key、API Secret）' },
        { status: 400 }
      );
    }

    // 1. 创建测试任务
    const date = new Date().toUTCString();
    const signature = generateIFlyTekSignature(IFLYTEK_HOST, date, IFLYTEK_CREATE_PATH, apiSecret);
    
    const authorizationOrigin = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    const createUrl = `https://${IFLYTEK_HOST}${IFLYTEK_CREATE_PATH}?host=${IFLYTEK_HOST}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          app_id: appId,
        },
        parameter: {
          dts: {
            vcn: 'x5_lingfeizhe',
            speed: 50,
            volume: 50,
            pitch: 50,
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
            text: Buffer.from('讯飞语音合成测试').toString('base64'),
          },
        },
      }),
    });

    const createData = await createResponse.json();

    if (createData.header?.code !== 0 || !createData.header?.task_id) {
      return NextResponse.json(
        { success: false, message: createData.header?.message || '任务创建失败' },
        { status: 401 }
      );
    }

    const taskId = createData.header.task_id;

    // 2. 查询任务结果（等待几秒）
    await new Promise(resolve => setTimeout(resolve, 3000));

    const queryDate = new Date().toUTCString();
    const querySignature = generateIFlyTekSignature(IFLYTEK_HOST, queryDate, IFLYTEK_QUERY_PATH, apiSecret);
    const queryAuthOrigin = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${querySignature}"`;
    const queryAuth = Buffer.from(queryAuthOrigin).toString('base64');

    const queryUrl = `https://${IFLYTEK_HOST}${IFLYTEK_QUERY_PATH}?host=${IFLYTEK_HOST}&date=${encodeURIComponent(queryDate)}&authorization=${queryAuth}`;

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          app_id: appId,
          task_id: taskId,
        },
      }),
    });

    const queryData = await queryResponse.json();

    if (queryData.header?.task_status === 5) {
      return NextResponse.json({
        success: true,
        message: '讯飞语音合成连接成功！',
      });
    }

    return NextResponse.json({
      success: true,
      message: '讯飞 API 连接正常，任务已创建（状态: ' + queryData.header?.task_status + '）',
    });
  } catch (error) {
    console.error('讯飞 TTS 测试失败:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '测试失败' },
      { status: 500 }
    );
  }
}
