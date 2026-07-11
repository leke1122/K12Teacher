import { NextRequest, NextResponse } from "next/server";

// 阿里云 TTS API 配置
const ALIYUN_TTS_URL = "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts";

// 获取阿里云 Access Token
async function getAliyunToken(accessKeyId: string, accessKeySecret: string): Promise<string> {
  const timestamp = new Date().toISOString();
  const signatureNonce = Math.random().toString(36).substring(2);

  const params = new URLSearchParams({
    AccessKeyId: accessKeyId,
    Action: "CreateToken",
    Version: "2019-02-28",
    Format: "JSON",
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: signatureNonce,
    Timestamp: timestamp,
  });

  const stringToSign = `GET&${encodeURIComponent("/")}&${encodeURIComponent(params.toString())}`;
  const hmac = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(accessKeySecret + "&"),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", hmac, new TextEncoder().encode(stringToSign));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  params.append("Signature", signatureBase64);

  const tokenUrl = `https://nls-gateway-cn-shanghai.aliyuncs.com/?${params.toString()}`;

  try {
    const response = await fetch(tokenUrl, { method: "GET" });
    const data = await response.json();

    if (data.Token?.Id) {
      return data.Token.Id;
    }
    throw new Error(data.Message || "获取 Token 失败");
  } catch (error) {
    throw error;
  }
}

// 简单测试 TTS API（不实际合成音频，只验证配置是否正确）
export async function POST(request: NextRequest) {
  try {
    const { accessKeyId, accessKeySecret, appKey } = await request.json();

    // 参数验证
    if (!accessKeyId || !accessKeySecret || !appKey) {
      return NextResponse.json(
        { success: false, message: "请填写完整的阿里云配置（AccessKey ID、AccessKey Secret、AppKey）" },
        { status: 400 }
      );
    }

    // 尝试获取 Token（验证 AccessKey 是否有效）
    try {
      const token = await getAliyunToken(accessKeyId, accessKeySecret);

      return NextResponse.json({
        success: true,
        message: "阿里云语音合成配置正确！Token 获取成功。",
        token: token.substring(0, 20) + "...", // 只返回部分 token
      });
    } catch (tokenError) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : "未知错误";

      // 判断错误类型
      if (errorMessage.includes("InvalidAccessKeyId")) {
        return NextResponse.json({
          success: false,
          message: "AccessKey ID 无效，请检查是否正确",
        }, { status: 401 });
      }

      if (errorMessage.includes("SignatureDoesNotMatch")) {
        return NextResponse.json({
          success: false,
          message: "AccessKey Secret 错误，请检查是否正确",
        }, { status: 401 });
      }

      return NextResponse.json({
        success: false,
        message: `配置验证失败: ${errorMessage}`,
      }, { status: 401 });
    }
  } catch (error) {
    console.error("TTS 测试失败:", error);
    return NextResponse.json(
      { success: false, message: "测试失败: " + (error instanceof Error ? error.message : "未知错误") },
      { status: 500 }
    );
  }
}
