/**
 * 历史综合练习题 API
 * 只从Supabase获取数据
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface PracticeQuestion {
  id: string;
  type: "choice" | "material";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedEvents?: string[];
  material?: {
    content: string;
    author?: string;
    source?: string;
  };
  gaokaoTag?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const unitId = searchParams.get("unitId");
  const difficulty = searchParams.get("difficulty") as "easy" | "medium" | "hard" | null;
  const category = searchParams.get("category");
  const count = parseInt(searchParams.get("count") || "10");

  if (!unitId) {
    return NextResponse.json({
      success: false,
      message: "缺少unitId参数",
    }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      data: {
        questions: [],
        total: 0,
        message: "Supabase未配置",
      },
    });
  }

  try {
    const { data: docxImport } = await supabase
      .from("docx_imports")
      .select("*")
      .eq("unit_id", unitId)
      .eq("user_id", "personal-user")
      .single();

    if (!docxImport) {
      return NextResponse.json({
        success: true,
        data: {
          questions: [],
          total: 0,
          message: `未找到单元 ${unitId} 的数据`,
        },
      });
    }

    const docxData = docxImport.data as any;
    let questions: PracticeQuestion[] = docxData.examFocus || [];

    // 如果没有examFocus字段，从concepts生成简单题目
    if (!questions.length && docxData.concepts) {
      questions = docxData.concepts.map((c: any, idx: number) => ({
        id: c.id || `q-${idx}`,
        type: "choice" as const,
        category: c.category || "知识点",
        difficulty: (c.importance >= 4 ? "hard" : c.importance >= 2 ? "medium" : "easy") as "easy" | "medium" | "hard",
        question: `关于${c.name}的说法，正确的是？`,
        options: ["A. " + c.definition, "B. 与其他概念混淆", "C. 完全错误", "D. 需要更多条件判断"],
        correctAnswer: 0,
        explanation: c.definition || "",
        relatedEvents: [],
        gaokaoTag: c.gaokaoFocus || "",
      }));
    }

    // 筛选
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }
    if (category) {
      questions = questions.filter((q) => q.category === category);
    }

    // 随机打乱
    questions = questions.sort(() => Math.random() - 0.5);
    questions = questions.slice(0, count);

    const stats = {
      easy: questions.filter((q) => q.difficulty === "easy").length,
      medium: questions.filter((q) => q.difficulty === "medium").length,
      hard: questions.filter((q) => q.difficulty === "hard").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total: questions.length,
        stats,
        dataSource: "docx",
        importId: docxImport.id,
        importedAt: docxImport.imported_at,
      },
    });
  } catch (err) {
    console.error("[practice] 查询失败:", err);
    return NextResponse.json({
      success: false,
      message: "查询失败",
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitId, difficulty = "medium", count = 5, topic } = body;

    if (!unitId) {
      return NextResponse.json(
        { success: false, message: "缺少unitId参数" },
        { status: 400 }
      );
    }

    // 获取API Key
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    // 如果有API Key，调用AI生成
    if (apiKey) {
      try {
        const aiResponse = await fetch(
          "https://api.deepseek.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "deepseek-v4-flash",
              messages: [
                {
                  role: "system",
                  content: "你是一位专业的高中历史老师，擅长根据辽宁高考风格出题。题目要严谨、准确、有针对性。",
                },
                {
                  role: "user",
                  content: `请根据以下信息生成 ${count} 道历史练习题：
单元：${unitId}
难度：${difficulty === "easy" ? "简单" : difficulty === "medium" ? "中等" : "困难"}
主题：${topic || "中国古代史"}

要求：
1. 选择题需要有4个选项
2. 每道题都要有详细解析
3. 需要标注高考关联的知识点

请以JSON格式返回：
{
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "category": "政治制度",
      "difficulty": "easy",
      "question": "题目内容",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "correctAnswer": 0,
      "explanation": "详细解析",
      "gaokaoTag": "高考关联"
    }
  ]
}`,
                },
              ],
              max_tokens: 3000,
              temperature: 0.7,
            }),
          }
        );

        const aiData = await aiResponse.json();
        if (aiData.choices?.[0]?.message?.content) {
          const content = aiData.choices[0].message.content;
          const jsonMatch =
            content.match(/```json\n?([\s\S]*?)\n?```/) ||
            content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            return NextResponse.json({
              success: true,
              data: {
                questions: parsed.questions.map(
                  (q: PracticeQuestion, idx: number) => ({
                    ...q,
                    id: q.id || `q-${Date.now()}-${idx}`,
                  })
                ),
                source: "ai_generated",
              },
            });
          }
        }
      } catch (aiErr) {
        console.warn("[practice] AI生成失败:", aiErr);
      }
    }

    // AI失败或无API Key，从Supabase获取
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        data: {
          questions: [],
          source: "none",
        },
      });
    }

    const { data: docxImport } = await supabase
      .from("docx_imports")
      .select("data")
      .eq("unit_id", unitId)
      .eq("user_id", "personal-user")
      .single();

    if (!docxImport?.data) {
      return NextResponse.json({
        success: true,
        data: {
          questions: [],
          source: "none",
        },
      });
    }

    const questions: PracticeQuestion[] =
      docxImport.data.examFocus || [];
    return NextResponse.json({
      success: true,
      data: {
        questions: questions.slice(0, count),
        source: "docx",
      },
    });
  } catch (error) {
    console.error("[practice] 生成失败:", error);
    return NextResponse.json(
      { success: false, message: "生成练习题失败" },
      { status: 500 }
    );
  }
}
