/**
 * 历史必背知识点 API
 * 只从Supabase获取数据，不使用内置fallback
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface HistoryMustKnowItem {
  id: string;
  unitId: string;
  unitTitle: string;
  title: string;
  year?: string;
  dynasty?: string;
  content: string;
  explanation: string;
  gaokaoFocus: string;
  relatedEvents: string[];
  typicalQuestions: {
    year: string;
    question: string;
    answer: string;
    difficulty: "easy" | "medium" | "hard";
  }[];
  importance: 1 | 2 | 3 | 4 | 5;
  source: "builtin" | "docx_import" | "ai_generated";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const unitId = searchParams.get("unitId");

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
        items: [],
        total: 0,
        highPriority: 0,
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
          items: [],
          total: 0,
          highPriority: 0,
          message: `未找到单元 ${unitId} 的数据`,
        },
      });
    }

    const docxData = docxImport.data as any;
    const concepts = docxData.concepts || [];

    const items: HistoryMustKnowItem[] = concepts.map((c: any, idx: number) => ({
      id: c.id || `docx-${unitId}-${idx}`,
      unitId: unitId,
      unitTitle: docxData.unitTitle || unitId,
      title: c.name || c.title || "",
      year: c.year || "",
      dynasty: c.dynasty || c.category || "",
      content: c.definition || c.description || "",
      explanation: c.definition || (c.keyPoints || []).join("\n") || "",
      gaokaoFocus: c.gaokaoFocus || "",
      relatedEvents: [],
      typicalQuestions: [],
      importance: Math.min(5, Math.max(1, c.importance || 3)) as 1 | 2 | 3 | 4 | 5,
      source: "docx_import" as const,
    }));

    items.sort((a, b) => b.importance - a.importance);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        highPriority: items.filter((i) => i.importance >= 4).length,
        dataSource: "docx",
        importId: docxImport.id,
        importedAt: docxImport.imported_at,
      },
    });
  } catch (err) {
    console.error("[must-know] 查询失败:", err);
    return NextResponse.json({
      success: false,
      message: "查询失败",
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, unitId, question } = body;

    if (!unitId) {
      return NextResponse.json(
        { success: false, message: "缺少unitId参数" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { success: false, message: "Supabase未配置" },
        { status: 500 }
      );
    }

    const { data: docxImport } = await supabase
      .from("docx_imports")
      .select("data")
      .eq("unit_id", unitId)
      .eq("user_id", "personal-user")
      .single();

    if (!docxImport?.data) {
      return NextResponse.json(
        { success: false, message: "未找到数据" },
        { status: 404 }
      );
    }

    const concepts = docxImport.data.concepts || [];
    const item = concepts.find(
      (c: any) => c.id === itemId || `docx-${c.id}` === itemId
    );

    if (!item) {
      return NextResponse.json(
        { success: false, message: "未找到指定的知识点" },
        { status: 404 }
      );
    }

    const resultItem: HistoryMustKnowItem = {
      id: item.id || itemId,
      unitId,
      unitTitle: docxImport.data.unitTitle || unitId,
      title: item.name || "",
      year: item.year || "",
      dynasty: item.category || "",
      content: item.definition || "",
      explanation: item.definition || "",
      gaokaoFocus: item.gaokaoFocus || "",
      relatedEvents: [],
      typicalQuestions: [],
      importance: Math.min(5, Math.max(1, item.importance || 3)) as 1 | 2 | 3 | 4 | 5,
      source: "docx_import",
    };

    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

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
              model: "deepseek-chat",
              messages: [
                {
                  role: "system",
                  content: "你是一位高中历史老师，讲解要：1）历史严谨，依据教材；2）条理清晰；3）说明因果关系；4）结合高考考点。",
                },
                {
                  role: "user",
                  content: `请详细讲解：\n标题：${resultItem.title}\n内容：${resultItem.content}\n高考考点：${resultItem.gaokaoFocus}\n${question ? `问题：${question}` : "请给出详细讲解"}`,
                },
              ],
              max_tokens: 2000,
              temperature: 0.7,
            }),
          }
        );

        const aiData = await aiResponse.json();
        if (aiData.choices?.[0]?.message?.content) {
          return NextResponse.json({
            success: true,
            data: {
              item: resultItem,
              explanation: aiData.choices[0].message.content,
            },
          });
        }
      } catch (aiErr) {
        console.warn("[must-know] AI生成失败:", aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        item: resultItem,
        explanation: resultItem.explanation,
      },
    });
  } catch (error) {
    console.error("[must-know] 生成讲解失败:", error);
    return NextResponse.json(
      { success: false, message: "生成讲解失败" },
      { status: 500 }
    );
  }
}
