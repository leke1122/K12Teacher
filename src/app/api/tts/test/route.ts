import { NextRequest, NextResponse } from "next/server";

// 阿里云 TTS API 端点
const ALIYUN_TTS_URL = "https://nls-gateway.aliyuncs.com/stream/v1/tts";
const ALIYUN_TOKEN_URL = "https://nls-gateway-cn-shanghai.aliyuncs.com/";

// 获取阿里云 Token（新版 API）
async function getAliyunToken(accessKeyId: string, accessKeySecret: string): Promise<string> {
  const timestamp = new Date().toUTCString();
  const signatureNonce = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();

  const params: Record<string, string> = {
    AccessKeyId: accessKeyId,
    Action: "CreateToken",
    Version: "2019-02-28",
    Format: "JSON",
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: signatureNonce,
    Timestamp: timestamp,
  };

  // 按字母顺序排序
  const sortedKeys = Object.keys(params).sort();
  let canonicalizedQueryString = "";
  for (const key of sortedKeys) {
    if (canonicalizedQueryString) canonicalizedQueryString += "&";
    canonicalizedQueryString +=
      encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
  }

  const stringToSign =
    "GET&" + encodeURIComponent("/") + "&" + encodeURIComponent(canonicalizedQueryString);

  const signature = crypto.createHmac("sha1", accessKeySecret + "&")
    .update(stringToSign)
    .digest("base64");

  canonicalizedQueryString += "&Signature=" + encodeURIComponent(signature);

  const tokenUrl = ALIYUN_TOKEN_URL + "?" + canonicalizedQueryString;

  const response = await fetch(tokenUrl);
  const data = await response.json();

  if (data.Token?.Id) {
    return data.Token.Id;
  }

  // 如果没有返回 Token，检查错误类型
  if (data.Message?.includes("Welcome")) {
    // 返回欢迎消息说明 API 可能需要不同的认证方式
    throw new Error("TOKEN_API_WELCOME");
  }

  throw new Error(data.Message || "获取 Token 失败");
}

// 测试 TTS 合成（直接用 AccessKey 签名）
async function testTTSWithAccessKey(
  accessKeyId: string,
  accessKeySecret: string,
  appKey: string
): Promise<{ success: boolean; message: string }> {
  const timestamp = new Date().toUTCString();
  const signatureNonce = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();

  // 使用 POST 方法调用 TTS
  const text = "你好，这是一段测试语音。";

  const params: Record<string, string> = {
    AccessKeyId: accessKeyId,
    AppKey: appKey,
    Format: "JSON",
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: signatureNonce,
    SignatureVersion: "1.0",
    Timestamp: timestamp,
  };

  // 按字母顺序排序
  const sortedKeys = Object.keys(params).sort();
  let queryString = "";
  for (const key of sortedKeys) {
    if (queryString) queryString += "&";
    queryString += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
  }

  const stringToSign =
    "POST&" + encodeURIComponent("/stream/v1/tts") + "&" + encodeURIComponent(queryString);

  const signature = crypto.createHmac("sha1", accessKeySecret + "&")
    .update(stringToSign)
    .digest("base64");

  queryString += "&Signature=" + encodeURIComponent(signature);

  const body = JSON.stringify({
    appkey: appKey,
    text: text,
    format: "mp3",
    sample_rate: 16000,
    voice: "xiaoyun",
  });

  const response = await fetch(ALIYUN_TTS_URL + "?" + queryString, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  const data = await response.json();

  if (response.headers.get("content-type")?.includes("audio")) {
    return { success: true, message: "TTS 合成成功！AppKey 有效。" };
  }

  // 解析错误
  const errorCode = data.status || data.code;
  const errorMessage = data.message || data.ErrorMessage || "未知错误";

  if (errorMessage.includes("ACCESS_DENIED") || errorMessage.includes("Missing authorization")) {
    return {
      success: false,
      message:
        "AppKey 或权限问题。请确认：1) AppKey 来自语音合成服务控制台；2) 已开通语音合成服务；3) AccessKey 有语音服务权限。",
    };
  }

  if (errorMessage.includes("InvalidAccessKeyId")) {
    return { success: false, message: "AccessKey ID 无效。" };
  }

  if (errorMessage.includes("SignatureDoesNotMatch")) {
    return { success: false, message: "AccessKey Secret 错误。" };
  }

  return { success: false, message: `错误 (${errorCode}): ${errorMessage}` };
}

// 测试 TTS API
export async function POST(request: NextRequest) {
  try {
    const { accessKeyId, accessKeySecret, appKey } = await request.json();

    // 参数验证
    if (!accessKeyId || !accessKeySecret || !appKey) {
      return NextResponse.json(
        {
          success: false,
          message: "请填写完整的阿里云配置（AccessKey ID、AccessKey Secret、AppKey）",
        },
        { status: 400 }
      );
    }

    // 步骤 1: 先验证 AccessKey 是否有效
    try {
      await getAliyunToken(accessKeyId, accessKeySecret);
    } catch (tokenError) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : "未知错误";

      if (errorMessage === "TOKEN_API_WELCOME") {
        // Token API 返回欢迎消息，尝试直接用 AccessKey 测试 TTS
        const ttsResult = await testTTSWithAccessKey(accessKeyId, accessKeySecret, appKey);
        return NextResponse.json(ttsResult, { status: ttsResult.success ? 200 : 401 });
      }

      if (errorMessage.includes("InvalidAccessKeyId")) {
        return NextResponse.json(
          { success: false, message: "AccessKey ID 无效，请检查是否正确" },
          { status: 401 }
        );
      }

      if (errorMessage.includes("SignatureDoesNotMatch")) {
        return NextResponse.json(
          { success: false, message: "AccessKey Secret 错误，请检查是否正确" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, message: `AccessKey 验证失败: ${errorMessage}` },
        { status: 401 }
      );
    }

    // 如果 Token 获取成功，说明 AccessKey 有效
    // 注意：阿里云语音合成 API 可能需要 Token 而不是直接用 AccessKey
    return NextResponse.json({
      success: true,
      message:
        "AccessKey 验证成功！但语音合成服务可能需要额外的 Token 认证。请确认 AppKey 来自语音合成控制台且已开通服务。",
    });
  } catch (error) {
    console.error("TTS 测试失败:", error);
    return NextResponse.json(
      {
        success: false,
        message: "测试失败: " + (error instanceof Error ? error.message : "未知错误"),
      },
      { status: 500 }
    );
  }
}
