// API 测试工具函数

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const QWEN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export interface TestResult {
  success: boolean;
  message: string;
}

// 测试 DeepSeek API
export async function testDeepSeekConnection(apiKey: string): Promise<TestResult> {
  if (!apiKey || apiKey.trim() === "") {
    return { success: false, message: "请先输入 DeepSeek API Key" };
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: "你好" }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
        return { success: false, message: "API Key 无效或已过期" };
      }
      if (response.status === 429) {
        return { success: false, message: "请求过于频繁，请稍后重试" };
      }
      if (response.status === 400) {
        return { success: false, message: "请求参数错误" };
      }
      
      return { 
        success: false, 
        message: errorData.error?.message || `请求失败 (${response.status})` 
      };
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return { success: true, message: "连接成功！" };
    }
    
    return { success: false, message: "响应格式异常" };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { success: false, message: "网络连接失败，请检查网络" };
    }
    return { success: false, message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}` };
  }
}

// 测试 Qwen-VL API
export async function testQwenConnection(apiKey: string): Promise<TestResult> {
  if (!apiKey || apiKey.trim() === "") {
    return { success: false, message: "请先输入 Qwen-VL API Key" };
  }

  try {
    const response = await fetch(QWEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "qwen-vl-plus",
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: "你好" }
            ]
          }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
        return { success: false, message: "API Key 无效或已过期" };
      }
      if (response.status === 429) {
        return { success: false, message: "请求过于频繁，请稍后重试" };
      }
      if (response.status === 400) {
        return { success: false, message: "请求参数错误或模型不可用" };
      }
      
      return { 
        success: false, 
        message: errorData.error?.message || `请求失败 (${response.status})` 
      };
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return { success: true, message: "连接成功！" };
    }
    
    return { success: false, message: "响应格式异常" };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { success: false, message: "网络连接失败，请检查网络" };
    }
    return { success: false, message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}` };
  }
}

// 测试 Supabase 连接
export async function testSupabaseConnection(url: string, anonKey: string): Promise<TestResult> {
  if (!url || url.trim() === "") {
    return { success: false, message: "请先输入 Supabase URL" };
  }
  if (!anonKey || anonKey.trim() === "") {
    return { success: false, message: "请先输入 Supabase anon Key" };
  }

  try {
    // 验证 URL 格式
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes("supabase")) {
        return { success: false, message: "URL 格式不正确，应为 supabase.co 域名" };
      }
    } catch {
      return { success: false, message: "Supabase URL 格式不正确" };
    }

    // 尝试获取项目信息
    const response = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        "apikey": anonKey.trim(),
        "Authorization": `Bearer ${anonKey.trim()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, message: "anon Key 无效或权限不足" };
      }
      return { success: false, message: `连接失败 (${response.status})` };
    }

    return { success: true, message: "连接成功！" };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { success: false, message: "网络连接失败，请检查网络" };
    }
    if (error instanceof Error && error.message.includes("Invalid URL")) {
      return { success: false, message: "Supabase URL 格式不正确" };
    }
    return { success: false, message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}` };
  }
}
