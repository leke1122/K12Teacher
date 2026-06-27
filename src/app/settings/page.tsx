"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { settingsSchema } from "@/lib/validations";
import { testDeepSeekConnection, testQwenConnection } from "@/lib/api-test";
import { localFallback } from "@/lib/localFallback";
import { useDataSync } from "@/hooks/useDataSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Database,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { storage, StorageKeys } from '@/lib/storage';
import { useUserGradeStore, GRADE_LABELS, type Grade } from '@/stores/gradeStore';

// 数据管理相关类型和常量
type DataItemId = 'textbook' | 'learning' | 'dashboard' | 'wrongQuestions' | 'weakPoints';

// 数据项与存储位置的映射关系
const DATA_STORAGE_MAP: Record<DataItemId, {
  label: string;
  description: string;
  localStorageKeys: string[];
}> = {
  textbook: {
    label: 'PDF教材数据',
    description: '已上传的教材和章节信息',
    localStorageKeys: [
      'textbookStorage', 'textbook_chapters', 'serverStorage',
      // 学科相关的教材 key
      ...['math', 'physics', 'chemistry', 'english', 'chinese', 'biology', 'geography', 'politics', 'history'].flatMap(
        s => [`pdf_${s}`, `chapters_${s}`, `edumind_fallback_pdf_${s}`, `edumind_fallback_chapters_${s}`, `subject-${s}`]
      )
    ],
  },
  learning: {
    label: '学习记录',
    description: '各学科学习进度和时长',
    localStorageKeys: [
      'learning_records', 'history_learning_progress', 'learning_progress',
      // 学科相关的学习进度 key
      ...['math', 'physics', 'chemistry', 'english', 'chinese', 'biology', 'geography', 'politics', 'history'].flatMap(
        s => [`progress_${s}`, `practice_${s}`, `stats_${s}`, `edumind_progress_${s}`, `edumind_practice_${s}`]
      )
    ],
  },
  dashboard: {
    label: '仪表盘数据',
    description: '首页统计和每日积累',
    localStorageKeys: [
      'dashboard_stats', 'daily_accumulation', 'edumind_dashboard_stats', 'edumind_daily_accumulation'
    ],
  },
  wrongQuestions: {
    label: '错题本',
    description: '所有错题记录',
    localStorageKeys: [
      'wrong_questions', 'wrong_questions_stats',
      // 学科相关的错题 key
      ...['math', 'physics', 'chemistry', 'english', 'chinese', 'biology', 'geography', 'politics', 'history'].flatMap(
        s => [`wrong_${s}`, `edumind_wrong_${s}`]
      )
    ],
  },
  weakPoints: {
    label: '薄弱项记录',
    description: 'AI分析的知识薄弱点',
    localStorageKeys: [
      'weak_points', 'analysis_results', 'edumind_weak_points', 'edumind_analysis_results'
    ],
  },
};

const DATA_ITEMS: Array<{ id: DataItemId; label: string; description: string }> = [
  { id: 'textbook', label: 'PDF教材数据', description: '已上传的教材和章节信息' },
  { id: 'learning', label: '学习记录', description: '各学科学习进度和时长' },
  { id: 'dashboard', label: '仪表盘数据', description: '首页统计和每日积累' },
  { id: 'wrongQuestions', label: '错题本', description: '所有错题记录' },
  { id: 'weakPoints', label: '薄弱项记录', description: 'AI分析的知识薄弱点' },
];

// 获取统计数据（从实际存储中读取）
function getDataStats(): Record<DataItemId, string | number> {
  // PDF教材数量 - 统计所有学科的教材
  let textbookCount = 0;
  const subjects = ['math', 'physics', 'chemistry', 'english', 'chinese', 'biology', 'geography', 'politics', 'history'];
  subjects.forEach(s => {
    if (storage.exists(`pdf_${s}`)) textbookCount++;
  });

  // 学习记录数量 - 统计学习进度记录
  let learningCount = 0;
  subjects.forEach(s => {
    const progress = storage.get(`progress_${s}`);
    if (progress) learningCount++;
  });

  // 仪表盘数据 - 统计今日学习时长
  const todayStats = storage.get<{ todayMinutes?: number }>('dashboard_stats');
  const dashboardValue = todayStats?.todayMinutes
    ? `${(todayStats.todayMinutes / 60).toFixed(1)}h`
    : '0h';

  // 错题数量
  let wrongCount = 0;
  subjects.forEach(s => {
    const wrong = storage.get(`wrong_${s}`);
    if (wrong && Array.isArray(wrong)) wrongCount += wrong.length;
  });

  // 薄弱项数量
  const weakPoints = storage.get<unknown[]>('weak_points');
  const weakCount = weakPoints?.length || 0;

  return {
    textbook: textbookCount || 0,
    learning: learningCount || 0,
    dashboard: dashboardValue,
    wrongQuestions: wrongCount || 0,
    weakPoints: weakCount || 0,
  };
}

// 清除指定数据项的本地存储
function clearLocalStorageData(itemId: DataItemId): { success: boolean; message: string } {
  const config = DATA_STORAGE_MAP[itemId];
  const removedKeys: string[] = [];

  config.localStorageKeys.forEach(key => {
    // 尝试多种 key 格式
    const variants = [
      key,
      `edumind_${key}`,
      key.replace('edumind_', ''),
    ];

    variants.forEach(variant => {
      if (localStorage.getItem(variant) !== null) {
        localStorage.removeItem(variant);
        removedKeys.push(variant);
      }
    });

    // 也使用统一存储层清除
    storage.remove(key);
  });

  return {
    success: true,
    message: `已清除 ${removedKeys.length} 个相关数据`,
  };
}

export default function SettingsPage() {
  const { grade, setGrade } = useUserGradeStore();
  const [gradeSaveMsg, setGradeSaveMsg] = useState('');
  const { settings, setSettings } = useSettingsStore();

  const handleGradeChange = (newGrade: Grade) => {
    const confirmed = window.confirm(
      `切换到${GRADE_LABELS[newGrade]}后，学习内容和分析数据将自动更新为对应年级。\n\n确定要切换吗？`
    );
    if (!confirmed) return;
    setGrade(newGrade);
    setGradeSaveMsg('✅ 年级已切换！');
    setTimeout(() => setGradeSaveMsg(''), 3000);
  };
  const [formData, setFormData] = useState({
    deepseekKey: "",
    qwenKey: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testStatus, setTestStatus] = useState({
    deepseek: "idle" as "idle" | "testing" | "success" | "error",
    qwen: "idle" as "idle" | "testing" | "success" | "error",
  });
  const [testMessage, setTestMessage] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearingPDF, setClearingPDF] = useState(false);

  // 数据同步状态
  const { isOnline, isSyncing, lastSource, logs, isCloudConfigured, clearLogs, manualSync } = useDataSync();
  const [syncing, setSyncing] = useState(false);

  // 数据管理状态
  const [selectedDataItems, setSelectedDataItems] = useState<Set<DataItemId>>(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [clearingSelected, setClearingSelected] = useState(false);
  const [dataStats, setDataStats] = useState<Record<DataItemId, string | number>>(() => getDataStats());

  // 刷新统计数据
  const refreshDataStats = () => {
    setDataStats(getDataStats());
  };

  // 切换数据项选中状态
  const toggleDataItem = (itemId: DataItemId) => {
    setSelectedDataItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // 处理清空所选数据
  const handleClearSelectedData = () => {
    if (selectedDataItems.size === 0) return;
    setConfirmInput('');
    setConfirmDialogOpen(true);
  };

  // 执行真正的数据清除
  const executeClearSelectedData = async () => {
    if (confirmInput !== '确认清空') {
      toast.error('确认文字不正确，请输入"确认清空"');
      return;
    }

    setClearingSelected(true);
    const results: Array<{ item: string; success: boolean; message: string }> = [];

    try {
      for (const itemId of selectedDataItems) {
        const config = DATA_STORAGE_MAP[itemId];
        try {
          const result = clearLocalStorageData(itemId);
          results.push({
            item: config.label,
            success: result.success,
            message: result.message,
          });
        } catch (err) {
          results.push({
            item: config.label,
            success: false,
            message: err instanceof Error ? err.message : '未知错误',
          });
        }
      }

      // 统计结果
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      // 关闭对话框
      setConfirmDialogOpen(false);
      setSelectedDataItems(new Set());

      // 刷新统计数据
      refreshDataStats();

      // 显示结果
      if (failCount === 0) {
        toast.success(`✅ 已成功清除 ${successCount} 项数据`);
      } else {
        toast.warning(`部分清除成功：${successCount} 项成功，${failCount} 项失败`);
      }
    } catch (error) {
      console.error('清除数据失败:', error);
      toast.error('清除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setClearingSelected(false);
    }
  };

  // 同步 settings 到表单
  useEffect(() => {
    if (settings) {
      setFormData({
        deepseekKey: settings.deepseekKey || "",
        qwenKey: settings.qwenKey || "",
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = () => {
    console.log("[Settings] handleSave called");
    try {
      const validated = settingsSchema.parse(formData);
      console.log("[Settings] Validation passed:", validated);
      setSettings({
        deepseekKey: validated.deepseekKey || "",
        qwenKey: validated.qwenKey || "",
      });
      console.log("[Settings] Settings saved to store, now in localStorage");
      const stored = localStorage.getItem("edumind-settings");
      console.log("[Settings] localStorage check:", stored);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      console.error("[Settings] Save failed:", error);
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const newErrors: Record<string, string> = {};
        zodError.errors.forEach((err) => {
          const field = err.path[0];
          if (typeof field === "string") {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        alert("请检查所有字段是否正确填写");
      }
    }
  };

  const handleTestDeepSeek = async () => {
    setTestStatus((prev) => ({ ...prev, deepseek: "testing" }));
    setTestMessage((prev) => ({ ...prev, deepseek: "" }));
    const result = await testDeepSeekConnection(formData.deepseekKey);
    setTestStatus((prev) => ({ ...prev, deepseek: result.success ? "success" : "error" }));
    setTestMessage((prev) => ({ ...prev, deepseek: result.message }));
  };

  const handleTestQwen = async () => {
    setTestStatus((prev) => ({ ...prev, qwen: "testing" }));
    setTestMessage((prev) => ({ ...prev, qwen: "" }));
    const result = await testQwenConnection(formData.qwenKey);
    setTestStatus((prev) => ({ ...prev, qwen: result.success ? "success" : "error" }));
    setTestMessage((prev) => ({ ...prev, qwen: result.message }));
  };

  const handleClearPDFs = async () => {
    const confirmed = window.confirm(
      "确定要清空所有已上传的PDF数据吗？\n\n这将删除：\n- 所有学科的PDF教材\n- 所有AI提取的章节数据\n\n此操作不可恢复！"
    );
    if (!confirmed) return;

    setClearingPDF(true);
    try {
      console.log("开始清空PDF数据...");

      const subjects = ["math", "physics", "chemistry", "english", "chinese", "biology", "geography", "politics", "history"];

      // 清理所有可能的存储 key（统一前缀 + 旧 fallback 前缀 + 裸 key）
      subjects.forEach((subject) => {
        storage.remove(StorageKeys.PDF(subject));
        storage.remove(StorageKeys.CHAPTERS(subject));
        localStorage.removeItem(`edumind_fallback_pdf_${subject}`);
        localStorage.removeItem(`edumind_fallback_chapters_${subject}`);
        localStorage.removeItem(`chapters_${subject}`);
        localStorage.removeItem(`pdf_${subject}`);
        localStorage.removeItem(`subject-${subject}`);
      });

      // 清理统一存储层
      storage.clear();
      localFallback.clear();

      console.log("本地存储清空成功");
      alert("✅ 所有PDF数据已清空！");
      window.location.href = '/';
    } catch (error) {
      console.error("清空PDF数据失败:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("❌ 清空失败：" + errorMessage);
    } finally {
      setClearingPDF(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await manualSync();
      if (result.success) {
        alert("✅ 同步成功！");
      } else {
        alert("⚠️ 同步失败：" + result.message);
      }
    } catch (error) {
      alert("❌ 同步异常：" + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setSyncing(false);
    }
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      "⚠️ 危险操作！\n\n这将清空：\n- 所有本地数据\n- 学习进度、错题本、单词等\n\n此操作不可恢复！\n\n确定要继续吗？"
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm("再次确认：所有数据将被永久删除！");
    if (!doubleConfirm) return;

    setClearingPDF(true);
    try {
      await localFallback.clear();
      clearLogs();

      const subjects = ["math", "physics", "chemistry", "english", "chinese", "biology", "geography", "politics", "history"];
      subjects.forEach((subject) => {
        storage.remove(StorageKeys.PDF(subject));
        storage.remove(StorageKeys.CHAPTERS(subject));
        localStorage.removeItem(`subject-${subject}`);
      });

      alert("✅ 所有数据已清空！");
      window.location.href = '/';
    } catch (error) {
      alert("❌ 清空失败：" + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setClearingPDF(false);
    }
  };

  const getTestButtonVariant = (status: "idle" | "testing" | "success" | "error") => {
    if (status === "success") return "default";
    if (status === "error") return "destructive";
    return "outline";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">设置</h1>

      {/* 年级选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📚 年级设置
          </CardTitle>
          <CardDescription>
            选择你所在的年级，系统将自动适配学习内容和难度
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>当前年级：</Label>
            <div className="flex gap-2">
              {(Object.keys(GRADE_LABELS) as Grade[]).map((g) => (
                <Button
                  key={g}
                  variant={grade === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGradeChange(g)}
                  className="min-w-[60px]"
                >
                  {GRADE_LABELS[g]}
                </Button>
              ))}
            </div>
          </div>
          {gradeSaveMsg && (
            <p className="text-sm text-green-600">{gradeSaveMsg}</p>
          )}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
            💡 提示：切换年级后，专注计时器默认时长、失分分析范围、每日积累内容将自动调整
          </div>
        </CardContent>
      </Card>

      {/* DeepSeek API */}
      <Card>
        <CardHeader>
          <CardTitle>DeepSeek API</CardTitle>
          <CardDescription>输入 DeepSeek API Key 用于 AI 对话功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deepseekKey">DeepSeek API Key</Label>
            <div className="flex gap-2">
              <Input
                id="deepseekKey"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                value={formData.deepseekKey}
                onChange={(e) => handleChange("deepseekKey", e.target.value)}
              />
              <Button
                type="button"
                variant={getTestButtonVariant(testStatus.deepseek)}
                onClick={handleTestDeepSeek}
                disabled={testStatus.deepseek === "testing"}
              >
                {testStatus.deepseek === "testing" ? "测试中..." : "测试连接"}
              </Button>
            </div>
            {errors.deepseekKey && <p className="text-sm text-destructive">{errors.deepseekKey}</p>}
            {testMessage.deepseek && (
              <p className={`text-sm ${testStatus.deepseek === "success" ? "text-green-600" : "text-red-600"}`}>
                {testStatus.deepseek === "success" ? "✅ " : "❌ "}
                {testMessage.deepseek}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Qwen-VL API */}
      <Card>
        <CardHeader>
          <CardTitle>Qwen-VL API</CardTitle>
          <CardDescription>输入通义千问 VL API Key 用于图片识别功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qwenKey">Qwen-VL API Key</Label>
            <div className="flex gap-2">
              <Input
                id="qwenKey"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxx"
                value={formData.qwenKey}
                onChange={(e) => handleChange("qwenKey", e.target.value)}
              />
              <Button
                type="button"
                variant={getTestButtonVariant(testStatus.qwen)}
                onClick={handleTestQwen}
                disabled={testStatus.qwen === "testing"}
              >
                {testStatus.qwen === "testing" ? "测试中..." : "测试连接"}
              </Button>
            </div>
            {errors.qwenKey && <p className="text-sm text-destructive">{errors.qwenKey}</p>}
            {testMessage.qwen && (
              <p className={`text-sm ${testStatus.qwen === "success" ? "text-green-600" : "text-red-600"}`}>
                {testStatus.qwen === "success" ? "✅ " : "❌ "}
                {testMessage.qwen}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 数据同步状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            数据同步状态
          </CardTitle>
          <CardDescription>查看数据存储和同步状态，手动同步或清空数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {isOnline ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <div className="text-sm">
                <div className="font-medium">网络状态</div>
                <div className={isOnline ? "text-green-600" : "text-red-600"}>{isOnline ? "在线" : "离线"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Database className="h-4 w-4 text-amber-600" />
              <div className="text-sm">
                <div className="font-medium">数据来源</div>
                <div className="text-amber-600">本地</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {isSyncing ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-gray-600" />
              )}
              <div className="text-sm">
                <div className="font-medium">同步状态</div>
                <div className={isSyncing ? "text-blue-600" : "text-gray-600"}>{isSyncing ? "同步中..." : "已完成"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Database className="h-4 w-4 text-gray-400" />
              <div className="text-sm">
                <div className="font-medium">存储方式</div>
                <div className="text-gray-400">本地存储</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleManualSync}
              disabled={syncing || !isOnline || !isCloudConfigured}
              className="flex-1"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  同步中
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  手动同步
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              disabled={clearingPDF}
              className="flex-1"
            >
              {clearingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  清空中...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空所有数据
                </>
              )}
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">最近同步日志</span>
                <Button variant="ghost" size="sm" onClick={clearLogs}>
                  清空日志
                </Button>
              </div>
              <ScrollArea className="h-[150px] rounded-md border p-2">
                <div className="space-y-1 text-xs font-mono">
                  {logs.slice(0, 20).map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={
                          log.status === "success"
                            ? "text-green-600"
                            : log.status === "error"
                            ? "text-red-600"
                            : log.status === "syncing"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      >
                        {log.status === "success" ? "✅" : log.status === "error" ? "❌" : log.status === "syncing" ? "🔄" : "•"}
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据管理卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            数据管理
          </CardTitle>
          <CardDescription>
            管理本地数据，勾选需要清空的数据项后点击确认清除
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {DATA_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={selectedDataItems.has(item.id)}
                  onCheckedChange={() => toggleDataItem(item.id)}
                />
                <Label
                  htmlFor={item.id}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground ml-2">
                    (共 {dataStats[item.id]} {item.id === 'textbook' ? '本' : item.id === 'wrongQuestions' ? '题' : item.id === 'weakPoints' ? '项' : item.id === 'dashboard' ? '' : '条'})
                  </span>
                </Label>
              </div>
            ))}
          </div>

          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={handleClearSelectedData}
                disabled={selectedDataItems.size === 0}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                确认清空所选数据
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  确认清空数据
                </DialogTitle>
                <DialogDescription>
                  即将清除以下数据项，此操作不可撤销：
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-4">
                {Array.from(selectedDataItems).map((itemId) => {
                  const item = DATA_ITEMS.find(i => i.id === itemId);
                  return (
                    <div key={itemId} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{item?.label}</span>
                      <span className="text-muted-foreground">- {DATA_STORAGE_MAP[itemId].description}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmInput">请输入 "确认清空" 以继续</Label>
                <Input
                  id="confirmInput"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="输入: 确认清空"
                  className="border-red-300 focus:border-red-500"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialogOpen(false)}
                  disabled={clearingSelected}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={executeClearSelectedData}
                  disabled={clearingSelected || confirmInput !== '确认清空'}
                >
                  {clearingSelected ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      清除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      确认清除
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="text-sm text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            提示：此操作不可撤销，请谨慎操作
          </p>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <Card>
        <CardContent className="pt-6">
          <Button type="button" onClick={handleSave} className="w-full">
            保存设置
          </Button>
          <p className={`text-center text-sm mt-2 transition-opacity ${saveSuccess ? "text-green-600 opacity-100" : "opacity-0"}`}>
            ✅ 设置已保存！
          </p>
        </CardContent>
      </Card>

      {/* 危险操作 */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            危险操作
          </CardTitle>
          <CardDescription>以下操作不可逆，请谨慎操作</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearPDFs} disabled={clearingPDF} className="w-full">
            {clearingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                清空中...
              </>
            ) : (
              "清空所有PDF数据"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
