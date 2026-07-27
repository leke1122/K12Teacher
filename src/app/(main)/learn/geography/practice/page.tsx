"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Loader2, FileQuestion, Lightbulb, Sparkles,
  ChevronRight, CheckCircle, XCircle, RotateCcw
} from "lucide-react";

interface Question {
  id: string;
  type: "choice" | "fill" | "material";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  relatedPoints: string[];
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q001",
    type: "choice",
    difficulty: "medium",
    question: "太阳系中，距太阳由近到远的第三颗行星是？",
    options: ["A. 金星", "B. 地球", "C. 火星", "D. 木星"],
    correctAnswer: "B",
    explanation: "太阳系八大行星按距太阳由近到远的顺序是：水星，金星，地球，火星，木星，土星，天王星，海王星。",
    relatedPoints: ["太阳系八大行星", "行星排列"]
  },
  {
    id: "q002",
    type: "choice",
    difficulty: "medium",
    question: "关于大气受热过程的说法，正确的是？",
    options: [
      "A. 太阳辐射是短波辐射",
      "B. 地面辐射是短波辐射",
      "C. 大气逆辐射是长波辐射",
      "D. 大气直接吸收太阳辐射而增温"
    ],
    correctAnswer: "A",
    explanation: "大气受热过程：太阳暖大地（太阳短波辐射到达地面）→大地暖大气（地面长波辐射加热大气）→大气还大气（大气逆辐射返还地面热量）。",
    relatedPoints: ["大气受热过程", "太阳短波辐射", "地面长波辐射"]
  },
  {
    id: "q003",
    type: "choice",
    difficulty: "easy",
    question: "热力环流形成的根本原因是？",
    options: ["A. 地球自转", "B. 太阳辐射", "C. 地面冷热不均", "D. 水陆差异"],
    correctAnswer: "C",
    explanation: "热力环流是大气运动最基本的形式，形成的根本原因是地面冷热不均，导致空气垂直运动，进而形成水平气压差异和水平运动。",
    relatedPoints: ["热力环流原理", "冷热不均"]
  },
  {
    id: "q004",
    type: "fill",
    difficulty: "medium",
    question: "热力环流的形成原理是：地面冷热不均 → 空气垂直运动 → 同一水平面上产生______ → 大气水平运动。",
    correctAnswer: "气压差异",
    explanation: "热力环流形成过程：1.受热不均导致空气膨胀上升或收缩下沉；2.垂直运动造成同一水平面上气压分布不均；3.水平气压差异产生水平气流。",
    relatedPoints: ["热力环流", "气压差异"]
  },
  {
    id: "q005",
    type: "choice",
    difficulty: "hard",
    question: "关于地球存在生命的条件，错误的是？",
    options: [
      "A. 安全的宇宙环境",
      "B. 稳定的太阳光照",
      "C. 适宜的温度",
      "D. 强烈的太阳活动"
    ],
    correctAnswer: "D",
    explanation: "地球存在生命的条件包括：外部条件（安全的宇宙环境、稳定的太阳光照）和自身条件（日地距离适中导致适宜的温度、地球体积质量适中形成适合生物呼吸的大气、液态水的存在）。强烈的太阳活动反而可能对地球生命造成威胁。",
    relatedPoints: ["地球存在生命的条件", "太阳活动"]
  }
];

function PracticeContent() {
  const params = useParams();
  const chapterId = (params.chapterId as string) || "ch1";

  const [questions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [materialAnswer, setMaterialAnswer] = useState("");

  const progress = questions.length
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;
  const currentQuestion = questions[currentIndex];

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (q.type === "choice" && answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleAnswer = (questionId: string, answer: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
      setMaterialAnswer("");
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(false);
      setMaterialAnswer("");
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setShowExplanation(false);
    setMaterialAnswer("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/learn/geography">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> 返回
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                AI 智能练习
              </h1>
              <p className="text-sm text-slate-500">
                第一章 宇宙中的地球
              </p>
            </div>
          </div>
        </div>

        {!showResult && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    {Object.keys(answers).length}/{questions.length} 题已完成
                  </span>
                  {currentQuestion && (
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.type === "choice"
                        ? "选择题"
                        : currentQuestion.type === "fill"
                        ? "填空题"
                        : "材料题"}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {showResult ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">
                {progress >= 80 ? "🎉" : progress >= 60 ? "👍" : "💪"}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                练习完成！
              </h2>
              <p className="text-slate-500 mb-6">
                正确率{" "}
                {Math.round(
                  (calculateScore() /
                    Math.max(questions.filter((q) => q.type === "choice").length, 1)) *
                    100
                )}
                %
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> 再练一次
                </Button>
                <Button
                  onClick={() =>
                    (window.location.href = `/learn/geography/knowledge/${chapterId}`)
                  }
                  className="gap-2"
                >
                  查看知识点 <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : currentQuestion ? (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    第 {currentIndex + 1}/{questions.length} 题
                  </Badge>
                  <Badge className={getDifficultyBadge(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty === "easy"
                      ? "简单"
                      : currentQuestion.difficulty === "medium"
                      ? "中等"
                      : "较难"}
                  </Badge>
                </div>
                {answers[currentQuestion.id] !== undefined && (
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> 已作答
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 rounded-lg border p-4">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.question}
                </p>
              </div>

              {currentQuestion.type === "choice" && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ""}
                  onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => {
                    const showCorrect =
                      showExplanation &&
                      option.startsWith(currentQuestion.correctAnswer);
                    const isWrongAnswer =
                      showExplanation &&
                      answers[currentQuestion.id] === option &&
                      option !== currentQuestion.correctAnswer;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                          showCorrect
                            ? "border-emerald-500 bg-emerald-50"
                            : isWrongAnswer
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        <RadioGroupItem
                          value={String.fromCharCode(65 + index)}
                          id={`option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option.replace(/^[A-D][.、]/, "")}
                        </Label>
                        {showCorrect && (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        )}
                        {isWrongAnswer && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              {currentQuestion.type === "fill" && (
                <div className="space-y-2">
                  <Label>请填写答案：</Label>
                  <Textarea
                    value={(answers[currentQuestion.id] as string) || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder="在此输入你的答案..."
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {showExplanation && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">答案解析</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-emerald-700">正确答案：</span>
                      <span className="text-emerald-900">
                        {currentQuestion.correctAnswer}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                    {currentQuestion.relatedPoints &&
                      currentQuestion.relatedPoints.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-emerald-600">相关考点：</span>
                          {currentQuestion.relatedPoints.map((p, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-emerald-100 text-emerald-700"
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  上一题
                </Button>
                <div className="flex gap-2">
                  {answers[currentQuestion.id] !== undefined && !showExplanation && (
                    <Button
                      variant="outline"
                      onClick={() => setShowExplanation(true)}
                    >
                      查看解析
                    </Button>
                  )}
                  <Button onClick={handleNext} className="gap-1">
                    {currentIndex === questions.length - 1 ? "完成练习" : "下一题"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <FileQuestion className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无练习题目</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <Link href={`/learn/geography/knowledge/${chapterId}`}>
            <Button variant="link" size="sm">
              查看知识点
            </Button>
          </Link>
          <Link href="/learn/geography">
            <Button variant="link" size="sm">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GeographyPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
