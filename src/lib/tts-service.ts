// TTS 服务模块 - 支持讯飞长文语音合成和阿里云 TTS
import crypto from 'crypto';

// 讯飞 TTS 配置
export interface IFlyTekConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

// 阿里云 TTS 配置
export interface AliyunConfig {
  accessKeyId: string;
  accessKeySecret: string;
  appKey: string;
}

// TTS 请求选项
export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  volume?: number;
  pitch?: number;
  format?: string;
}

// TTS 结果
export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: Buffer;
  message?: string;
  taskId?: string;
}

// ==================== 讯飞长文语音合成 ====================

// 讯飞签名生成
function generateIFlyTekSignature(
  host: string,
  date: string,
  path: string,
  apiSecret: string
): string {
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${path}`;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');
}

// 讯飞 API 调用
export async function iFlyTekTTS(
  config: IFlyTekConfig,
  request: TTSRequest
): Promise<TTSResult> {
  const host = 'api-dx.xf-yun.com';
  const path = '/v1/private/dts_create';
  const date = new Date().toUTCString();

  // 生成签名
  const signature = generateIFlyTekSignature(host, date, `POST ${path} HTTP/1.1`, config.apiSecret);
  
  const authorizationOrigin = `api_key="${config.apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  const url = `https://${host}${path}?host=${host}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        header: {
          app_id: config.appId,
        },
        parameter: {
          dts: {
            vcn: request.voice || 'x5_lingfeizhe',
            speed: request.speed ?? 50,
            volume: request.volume ?? 50,
            pitch: request.pitch ?? 50,
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
            text: Buffer.from(request.text).toString('base64'),
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.header?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.header?.code === 0 && data.header?.task_id) {
      return {
        success: true,
        taskId: data.header.task_id,
        message: '任务创建成功',
      };
    }

    return {
      success: false,
      message: data.header?.message || '未知错误',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// 查询讯飞 TTS 任务结果
export async function queryIFLyTekTTS(
  config: IFlyTekConfig,
  taskId: string
): Promise<TTSResult> {
  const host = 'api-dx.xf-yun.com';
  const path = '/v1/private/dts_query';
  const date = new Date().toUTCString();

  const signature = generateIFlyTekSignature(host, date, `POST ${path} HTTP/1.1`, config.apiSecret);
  
  const authorizationOrigin = `api_key="${config.apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  const url = `https://${host}${path}?host=${host}&date=${encodeURIComponent(date)}&authorization=${authorization}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        header: {
          app_id: config.appId,
          task_id: taskId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.header?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    // 任务完成
    if (data.header?.task_status === 5 && data.payload?.audio?.audio) {
      const audioUrl = Buffer.from(data.payload.audio.audio, 'base64').toString('utf8');
      
      // 下载音频
      try {
        const audioResponse = await fetch(audioUrl);
        if (audioResponse.ok) {
          const arrayBuffer = await audioResponse.arrayBuffer();
          return {
            success: true,
            audioBuffer: Buffer.from(arrayBuffer),
            audioUrl,
            message: '音频合成成功',
          };
        }
      } catch {
        return {
          success: true,
          audioUrl,
          message: '音频URL获取成功',
        };
      }
    }

    // 任务进行中
    if (data.header?.task_status) {
      return {
        success: true,
        taskId,
        message: `任务状态: ${data.header.task_status}`,
      };
    }

    return {
      success: false,
      message: data.header?.message || '查询失败',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// ==================== 阿里云 TTS ====================

// 阿里云签名生成
function generateAliyunSignature(
  secret: string,
  stringToSign: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('base64');
}

// 阿里云 TTS 调用
export async function aliyunTTS(
  config: AliyunConfig,
  request: TTSRequest
): Promise<TTSResult> {
  const appKey = config.appKey;
  const text = request.text;
  const voice = request.voice || 'xiaoyun';
  const volume = request.volume ?? 50;
  const speechRate = ((request.speed ?? 50) - 50) * 2; // 阿里云范围 -200 到 200
  const pitchRate = ((request.pitch ?? 50) - 50) * 2;

  // 生成 UUID
  const uuid = crypto.randomUUID().replace(/-/g, '');

  // 构建请求体
  const requestBody = JSON.stringify({
    appkey: appKey,
    text,
    token: uuid,
    format: 'mp3',
    voice,
    volume: String(volume / 2), // 阿里云范围 0-100
    speech_rate: String(speechRate),
    pitch_rate: String(pitchRate),
  });

  // 生成签名
  const stringToSign = `POST /tts HTTP/1.1\n${requestBody.length}`;
  const signature = generateAliyunSignature(config.accessKeySecret, stringToSign);

  try {
    const response = await fetch('https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NLS-Token': config.accessKeyId, // 使用 accessKeyId 作为 token
        'X-NLS-Signature': signature,
        'Content-Length': String(requestBody.length),
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return {
        success: false,
        message: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 检查是否是 JSON 错误响应
    try {
      const jsonResponse = JSON.parse(buffer.toString());
      return {
        success: false,
        message: jsonResponse.message || 'TTS 请求失败',
      };
    } catch {
      // 不是 JSON，说明是音频数据
      return {
        success: true,
        audioBuffer: buffer,
        message: '音频合成成功',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// 测试讯飞连接
export async function testIFlyTekConnection(config: IFlyTekConfig): Promise<{ success: boolean; message: string }> {
  const result = await iFlyTekTTS(config, {
    text: '讯飞语音合成测试',
    voice: 'x5_lingfeizhe',
  });

  if (result.success && result.taskId) {
    // 查询结果
    const queryResult = await queryIFLyTekTTS(config, result.taskId);
    if (queryResult.success) {
      return { success: true, message: '讯飞语音合成连接成功' };
    }
  }

  return {
    success: false,
    message: result.message || '讯飞连接失败',
  };
}

// 测试阿里云连接
export async function testAliyunConnection(config: AliyunConfig): Promise<{ success: boolean; message: string }> {
  const result = await aliyunTTS(config, {
    text: '阿里云语音合成测试',
    voice: 'xiaoyun',
  });

  if (result.success && result.audioBuffer) {
    return { success: true, message: '阿里云语音合成连接成功' };
  }

  return {
    success: false,
    message: result.message || '阿里云连接失败',
  };
}

// 获取讯飞可用发音人
export const IFlyTekVoices = [
  { value: 'x5_lingfeizhe', label: '讯飞飞侠（女）' },
  { value: 'x5_lingxiaoxue', label: '讯飞雪儿（女）' },
  { value: 'x4_EnUs_Catherine_profnews', label: 'Catherine（英文）' },
  { value: 'x4_lingfeihong_document', label: '讯飞宏哥（男）' },
  { value: 'x4_lingfeichen_assist', label: '讯飞晨姐（女）' },
  { value: 'x4_pengfei', label: '鹏飞（男）' },
  { value: 'x4_yeting', label: '叶婷（女）' },
  { value: 'x4_qianxue', label: '千雪（女）' },
  { value: 'x4_guanshan', label: '关山（男）' },
];

// 获取阿里云可用发音人
export const AliyunVoices = [
  { value: 'xiaoyun', label: '云小萌（女）' },
  { value: 'xiaogang', label: '小刚（男）' },
  { value: 'aiqi', label: '艾琪（女）' },
  { value: 'aiwei', label: '艾伟（男）' },
  { value: 'ruoxi', label: '若兮（女）' },
  { value: 'xiaoxian', label: '小仙（女）' },
  { value: 'xiaoyeye', label: '小叶儿（女）' },
  { value: 'shanshan', label: '姗姗（女）' },
];
