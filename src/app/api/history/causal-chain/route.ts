/**
 * 历史因果链 API
 * 只从Supabase获取数据
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface CausalChainNode {
  title: string;
  description: string;
  source?: string;
}

export interface CausalChain {
  eventName: string;
  chapterId: string;
  farCauses: CausalChainNode[];
  nearCauses: CausalChainNode[];
  event: string;
  directEffects: CausalChainNode[];
  deepEffects: CausalChainNode[];
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
        links: [],
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
          links: [],
          message: `未找到单元 ${unitId} 的数据`,
        },
      });
    }

    const docxData = docxImport.data as any;
    const causalLinks = docxData.causalLinks || [];

    const links = causalLinks.map((l: any) => ({
      from: l.sourceId || l.from || "",
      to: l.targetId || l.to || "",
      description: l.logic || l.description || "",
    }));

    return NextResponse.json({
      success: true,
      data: {
        links,
        total: links.length,
        dataSource: "docx",
        importId: docxImport.id,
        importedAt: docxImport.imported_at,
      },
    });
  } catch (err) {
    console.error("[causal-chain] 查询失败:", err);
    return NextResponse.json({
      success: false,
      message: "查询失败",
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, unitId, chapterId } = body;

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

    const docxData = docxImport.data;
    const lower = (eventName || "").toLowerCase();

    // 从timelineEvents中查找匹配
    const events = docxData.events || [];
    const matchedEvents = events.filter(
      (e: any) =>
        (e.title || "").toLowerCase().includes(lower) ||
        (e.summary || "").toLowerCase().includes(lower)
    );

    // 从concepts中查找匹配
    const concepts = docxData.concepts || [];
    const matchedConcepts = concepts.filter(
      (c: any) =>
        (c.name || "").toLowerCase().includes(lower) ||
        (c.definition || "").toLowerCase().includes(lower)
    );

    const farCauses: CausalChainNode[] = [];
    const nearCauses: CausalChainNode[] = [];
    const directEffects: CausalChainNode[] = [];
    const deepEffects: CausalChainNode[] = [];

    // 添加匹配的概念作为原因
    for (const c of matchedConcepts.slice(0, 3)) {
      farCauses.push({
        title: c.name || "",
        description: c.definition || "",
        source: "docx_import",
      });
    }

    // 添加匹配的事件
    for (const e of matchedEvents.slice(0, 3)) {
      nearCauses.push({
        title: e.title || "",
        description: e.summary || "",
        source: "docx_import",
      });
      directEffects.push({
        title: e.title || "",
        description: e.summary || "",
        source: "docx_import",
      });
    }

    // 添加因果链数据
    const causalLinks = docxData.causalLinks || [];
    const matchedLinks = causalLinks.filter(
      (l: any) =>
        (l.sourceId || l.from || "").toLowerCase().includes(lower) ||
        (l.targetId || l.to || "").toLowerCase().includes(lower)
    );

    for (const l of matchedLinks.slice(0, 4)) {
      const title = l.targetId === eventName ? l.sourceId : l.targetId;
      const desc = l.logic || l.description || "";
      if (l.targetId === eventName) {
        nearCauses.push({ title, description: desc, source: "docx_import" });
      } else {
        deepEffects.push({ title, description: desc, source: "docx_import" });
      }
    }

    const chain: CausalChain = {
      eventName: eventName || "",
      chapterId: chapterId || unitId,
      farCauses: farCauses.slice(0, 5),
      nearCauses: nearCauses.slice(0, 4),
      event: matchedEvents[0]?.summary || eventName || "历史事件",
      directEffects: directEffects.slice(0, 4),
      deepEffects: deepEffects.slice(0, 4),
    };

    return NextResponse.json({
      success: true,
      source: "docx_import",
      data: chain,
    });
  } catch (error) {
    console.error("[causal-chain] 生成失败:", error);
    return NextResponse.json(
      { success: false, message: "生成因果链失败" },
      { status: 500 }
    );
  }
}
