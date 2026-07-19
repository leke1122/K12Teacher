'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  total: number;
}

export default function ImportWordsPage() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    setImporting(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 90));
      }, 500);

      const res = await fetch('/api/words/import-from-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: 'c:\\Users\\Admin\\Desktop\\高中\\蝶变英语3500词',
        }),
      });

      clearInterval(progressInterval);

      const data = await res.json();
      setProgress(100);

      if (data.success) {
        setResult({
          success: data.imported,
          failed: data.failed,
          total: data.total,
        });
      } else {
        setError(data.error || '导入失败');
      }
    } catch (err) {
      setError('导入过程中发生错误');
      console.error(err);
    } finally {
      setImporting(false);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            📥 导入单词数据
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-6 space-y-6">
            {/* 说明 */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                导入说明
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>系统将从以下路径读取单词文件：</p>
                <code className="block bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs">
                  c:\Users\Admin\Desktop\高中\蝶变英语3500词
                </code>
                <p className="text-slate-500 mt-2">需要以下三个文件：</p>
                <ul className="list-disc list-inside text-slate-500">
                  <li>01-高频核心词.md（约800词）</li>
                  <li>02-中频词.md（约1200词）</li>
                  <li>03-低频词.md（约1500词）</li>
                </ul>
              </div>
            </div>

            {/* AI 补齐说明 */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    AI 智能补齐
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    中频词和低频词缺少例句、翻译、搭配、同义词、反义词时，
                    系统会自动调用 DeepSeek API 补齐缺失内容。
                  </p>
                </div>
              </div>
            </div>

            {/* 导入按钮 */}
            {!result && !error && (
              <div className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      开始导入
                    </>
                  )}
                </Button>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>正在解析和导入...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* 成功结果 */}
            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      导入成功！
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      成功导入 {result.success} 个单词
                      {result.failed > 0 && `（${result.failed} 个失败）`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {result.total}
                    </p>
                    <p className="text-xs text-slate-500">总词数</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {result.success}
                    </p>
                    <p className="text-xs text-green-600">成功</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {result.failed}
                    </p>
                    <p className="text-xs text-red-600">失败</p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.location.href = '/words'}
                >
                  去学习
                </Button>
              </div>
            )}

            {/* 错误结果 */}
            {error && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">
                      导入失败
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setError(null)}
                >
                  重试
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 数据库表结构说明 */}
        <Card className="mt-6 bg-slate-100 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              数据库表结构
            </h3>
            <p className="text-xs text-slate-500 space-y-1">
              <code className="block">words</code> - 存储单词数据（词根、音标、释义、例句等）<br/>
              <code className="block">word_mastery</code> - 存储掌握度（用户-单词-掌握等级）<br/>
              <code className="block">word_learning_records</code> - 存储学习记录（学习行为日志）<br/>
              <span className="text-amber-500">
                首次使用请先在 Supabase SQL Editor 中执行建表语句
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
