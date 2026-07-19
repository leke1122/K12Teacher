/**
 * 历史卡牌 API
 * 只从Supabase获取数据
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get("unitId");
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

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
        cards: [],
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
          cards: [],
          total: 0,
          message: `未找到单元 ${unitId} 的数据`,
        },
      });
    }

    const docxData = docxImport.data as any;
    let cards = docxData.cards || [];

    // 如果没有cards字段，从concepts生成
    if (!cards.length && docxData.concepts) {
      cards = docxData.concepts.map((c: any, idx: number) => ({
        id: c.id || `card-${idx}`,
        title: c.name || "",
        category: c.category || "知识点",
        front: c.name || "",
        back: c.definition || "",
        difficulty: c.importance >= 4 ? "hard" : c.importance >= 2 ? "medium" : "easy",
      }));
    }

    // 筛选
    if (category) {
      cards = cards.filter((c: any) => c.category === category);
    }
    if (difficulty) {
      cards = cards.filter((c: any) => c.difficulty === difficulty);
    }

    return NextResponse.json({
      success: true,
      data: {
        cards,
        total: cards.length,
        unitTitle: docxData.unitTitle || unitId,
        dataSource: "docx",
        importId: docxImport.id,
        importedAt: docxImport.imported_at,
      },
    });
  } catch (err) {
    console.error("[cards] 查询失败:", err);
    return NextResponse.json({
      success: false,
      message: "查询失败",
    }, { status: 500 });
  }
}
