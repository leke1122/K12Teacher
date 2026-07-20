/**
 * 历史必背知识点 API
 * 只从Supabase获取数据，不使用内置fallback
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// 根据 unitId 和概念 id 推断朝代（兜底方案）
function inferDynasty(unitId: string, conceptId: string, name: string): string {
  const inferByUnit: Record<string, string> = {
    u1: '先秦-秦汉',
    u2: '魏晋-隋唐',
    u3: '宋元',
    u4: '明清',
    u5: '晚清',
  };

  // 根据 name 中的关键词推断
  if (name.includes('石器')) return name.includes('旧') ? '旧石器时代' : '新石器时代';
  if (name.includes('仰韶') || name.includes('河姆渡') || name.includes('龙山') || name.includes('红山') || name.includes('良渚') || name.includes('大汶口')) return '新石器时代';
  if (name.includes('夏朝')) return '夏朝';
  if (name.includes('商朝')) return '商朝';
  if (name.includes('西周')) return '西周';
  if (name.includes('东周')) return '东周';
  if (name.includes('分封')) return '西周';
  if (name.includes('宗法')) return '西周';
  if (name.includes('礼乐')) return '西周';
  if (name.includes('商鞅')) return '战国';
  if (name.includes('百家争鸣')) return '春秋战国';
  if (name.includes('孔子') || name.includes('老子')) return '春秋';
  if (name.includes('孟子') || name.includes('荀子') || name.includes('庄子') || name.includes('韩非') || name.includes('墨子') || name.includes('诸子')) return '战国';
  if (name.includes('秦朝') || name.includes('秦始皇') || name.includes('郡县') || name.includes('皇帝制度') || name.includes('三公九卿')) return '秦朝';
  if (name.includes('汉武帝')) return '西汉';
  if (name.includes('董仲舒')) return '西汉';
  if (name.includes('光武')) return '东汉';
  if (name.includes('庄园')) return '东汉';
  if (name.includes('司马迁') || name.includes('班固') || name.includes('张仲景') || name.includes('华佗') || name.includes('蔡伦') || name.includes('张衡')) return '两汉';
  if (name.includes('三国')) return '三国';
  if (name.includes('西晋')) return '西晋';
  if (name.includes('东晋')) return '东晋';
  if (name.includes('南朝')) return '南朝';
  if (name.includes('孝文帝')) return '北朝';
  if (name.includes('北魏')) return '北魏';
  if (name.includes('隋朝') || name.includes('隋文帝') || name.includes('大运河')) return '隋朝';
  if (name.includes('贞观')) return '唐朝';
  if (name.includes('武周') || name.includes('武则天')) return '唐朝';
  if (name.includes('开元')) return '唐朝';
  if (name.includes('安史')) return '唐朝';
  if (name.includes('三省六部')) return '隋唐';
  if (name.includes('科举')) return '隋唐';
  if (name.includes('租庸调') || name.includes('两税法')) return '唐朝';
  if (name.includes('文成公主') || name.includes('天可汗')) return '唐朝';
  if (name.includes('玄奘') || name.includes('鉴真') || name.includes('遣唐使')) return '唐朝';
  if (name.includes('李白') || name.includes('杜甫') || name.includes('王羲之') || name.includes('吴道子')) return '东晋-唐';
  if (name.includes('杯酒释兵权') || name.includes('王安石')) return '北宋';
  if (name.includes('澶渊')) return '北宋';
  if (name.includes('庆历')) return '北宋';
  if (name.includes('辽的')) return '辽朝';
  if (name.includes('猛安')) return '金朝';
  if (name.includes('行省')) return '元朝';
  if (name.includes('交子') || name.includes('坊市')) return '宋朝';
  if (name.includes('五大名窑')) return '宋朝';
  if (name.includes('经济重心')) return '唐宋';
  if (name.includes('程朱理学')) return '宋元';
  if (name.includes('陆王') || name.includes('王阳明')) return '明朝';
  if (name.includes('活字') || name.includes('毕昇') || name.includes('火药') || name.includes('指南针')) return '宋元';
  if (name.includes('沈括') || name.includes('郭守敬')) return '宋元';
  if (name.includes('废除丞相') || name.includes('内阁')) return '明朝';
  if (name.includes('郑和')) return '明朝';
  if (name.includes('戚继光') || name.includes('海禁')) return '明朝';
  if (name.includes('军机处') || name.includes('奏折') || name.includes('文字狱')) return '清朝';
  if (name.includes('台湾府') || name.includes('驻藏大臣') || name.includes('伊犁') || name.includes('理藩') || name.includes('改土归流')) return '清朝';
  if (name.includes('闭关锁国')) return '清朝';
  if (name.includes('资本主义萌芽') || name.includes('白银货币')) return '明清';
  if (name.includes('黄宗羲') || name.includes('顾炎武') || name.includes('王夫之')) return '明末清初';
  if (name.includes('鸦片') || name.includes('南京条约') || name.includes('《马关条约》') || name.includes('辛丑') || name.includes('八国联军')) return '清朝';
  if (name.includes('太平天国')) return '清朝';
  if (name.includes('洋务')) return '清朝';
  if (name.includes('左宗棠')) return '清朝';
  if (name.includes('戊戌') || name.includes('百日维新')) return '清朝';

  // 根据 unitId 返回默认
  return inferByUnit[unitId] || '';
}

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

    const items: HistoryMustKnowItem[] = concepts.map((c: any, idx: number) => {
      // 优先使用数据中已有的 dynasty 字段，否则智能推断
      const dynasty = c.dynasty || c.timeRange || c.dynastyTag || c.period || inferDynasty(unitId, c.id, c.name || c.title || "");
      return {
        id: c.id || `docx-${unitId}-${idx}`,
        unitId: unitId,
        unitTitle: docxData.unitTitle || unitId,
        title: c.name || c.title || "",
        year: c.year || "",
        dynasty,
        content: c.definition || c.description || "",
        explanation: c.definition || (c.keyPoints || []).join("\n") || "",
        gaokaoFocus: c.gaokaoFocus || "",
        relatedEvents: [],
        typicalQuestions: [],
        importance: Math.min(5, Math.max(1, c.importance || 3)) as 1 | 2 | 3 | 4 | 5,
        source: "docx_import" as const,
      };
    });

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
