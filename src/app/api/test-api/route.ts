import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const QWEN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, type } = body;

    if (type === 'deepseek') {
      if (!apiKey || apiKey.trim() === "") {
        return NextResponse.json({ success: false, message: "请先输入 DeepSeek API Key" });
      }

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [{ role: "user", content: "你好" }],
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({ success: false, message: "API Key 无效或已过期" });
        }
        if (response.status === 429) {
          return NextResponse.json({ success: false, message: "请求过于频繁，请稍后重试" });
        }
        if (response.status === 400) {
          const errorMsg = errorData.error?.message || errorData.message || "请求参数错误";
          return NextResponse.json({ success: false, message: errorMsg });
        }
        
        return NextResponse.json({ 
          success: false, 
          message: errorData.error?.message || errorData.message || `请求失败 (${response.status})` 
        });
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        return NextResponse.json({ success: true, message: "连接成功！" });
      }
      
      return NextResponse.json({ success: false, message: "响应格式异常" });
    }

    if (type === 'qwen') {
      if (!apiKey || apiKey.trim() === "") {
        return NextResponse.json({ success: false, message: "请先输入 Qwen-VL API Key" });
      }

      const response = await fetch(QWEN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "qwen-vl-plus",
          messages: [{ role: "user", content: [{ type: "text", text: "你好" }] }],
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({ success: false, message: "API Key 无效或已过期" });
        }
        if (response.status === 429) {
          return NextResponse.json({ success: false, message: "请求过于频繁，请稍后重试" });
        }
        
        return NextResponse.json({ 
          success: false, 
          message: errorData.error?.message || `请求失败 (${response.status})` 
        });
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        return NextResponse.json({ success: true, message: "连接成功！" });
      }
      
      return NextResponse.json({ success: false, message: "响应格式异常" });
    }

    return NextResponse.json({ success: false, message: "未知的测试类型" });
  } catch (error) {
    console.error('[API Test Error]', error);
    return NextResponse.json({ 
      success: false, 
      message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}` 
    });
  }
}
