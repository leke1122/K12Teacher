import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, type } = body;

    if (type === 'deepseek') {
      if (!apiKey || apiKey.trim() === "") {
        return NextResponse.json({ success: false, message: "请先输入 DeepSeek API Key" });
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({ success: false, message: "API Key 无效或已过期" });
        }
        if (response.status === 429) {
          return NextResponse.json({ success: false, message: "请求过于频繁，请稍后重试" });
        }
        return NextResponse.json({ 
          success: false, 
          message: data.error?.message || data.message || `请求失败 (${response.status})` 
        });
      }

      if (data.choices && data.choices[0]?.message) {
        return NextResponse.json({ success: true, message: "连接成功！" });
      }
      
      return NextResponse.json({ success: false, message: "响应格式异常" });
    }

    if (type === 'qwen') {
      if (!apiKey || apiKey.trim() === "") {
        return NextResponse.json({ success: false, message: "请先输入 Qwen-VL API Key" });
      }

      const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "qwen-vl-plus",
          messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
          max_tokens: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({ success: false, message: "API Key 无效或已过期" });
        }
        if (response.status === 429) {
          return NextResponse.json({ success: false, message: "请求过于频繁，请稍后重试" });
        }
        return NextResponse.json({ 
          success: false, 
          message: data.error?.message || `请求失败 (${response.status})` 
        });
      }

      if (data.choices && data.choices[0]?.message) {
        return NextResponse.json({ success: true, message: "连接成功！" });
      }
      
      return NextResponse.json({ success: false, message: "响应格式异常" });
    }

    return NextResponse.json({ success: false, message: "未知的测试类型" });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}` 
    });
  }
}
