'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Headphones, Mic, Play, Pause, Volume2,
  Clock, ListMusic, Settings, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const LISTENING_PRACTICES = [
  { id: 1, title: '日常对话', description: '购物、点餐、问路等场景', count: 20, duration: '15分钟' },
  { id: 2, title: '校园场景', description: '课堂、图书馆、宿舍等', count: 15, duration: '12分钟' },
  { id: 3, title: '新闻播报', description: 'VOA慢速英语新闻', count: 10, duration: '10分钟' },
  { id: 4, title: '短文理解', description: '高考听力短文专项', count: 8, duration: '8分钟' },
];

export default function EnglishListeningPage() {
  const router = useRouter();
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartPractice = (practiceId: number) => {
    setIsLoading(true);
    // 模拟加载
    setTimeout(() => {
      setSelectedPractice(practiceId);
      setIsLoading(false);
    }, 500);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/40">
      {/* 顶部导航 */}
      <header className="sticky top-16 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/english')} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-rose-500" />
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">听力训练</h1>
            </div>
            <Badge variant="outline" className="ml-auto bg-rose-50 text-rose-600">
              开发中
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {selectedPractice ? (
          // 练习界面
          <div className="space-y-6">
            <Card className="border-rose-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {LISTENING_PRACTICES.find(p => p.id === selectedPractice)?.title}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPractice(null)}>
                    返回列表
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 播放控制 */}
                <div className="bg-rose-100 dark:bg-rose-900/30 rounded-2xl p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8 ml-1" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">点击播放听力材料</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      00:00 / 03:45
                    </span>
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      1.0x
                    </span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>第 1/5 题</span>
                    <span>50%</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>

                {/* 题目选项 */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">1. What is the main topic of the conversation?</p>
                  {['A. Shopping for clothes', 'B. Meeting a friend', 'C. Planning a trip', 'D. Looking for a job'].map((opt, idx) => (
                    <button
                      key={idx}
                      className="w-full p-4 text-left rounded-lg border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all"
                    >
                      <span className="font-medium mr-2">{opt.charAt(0)}.</span>
                      {opt.substring(2)}
                    </button>
                  ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" disabled>
                    上一题
                  </Button>
                  <Button className="flex-1 bg-rose-500 hover:bg-rose-600">
                    下一题
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // 选择界面
          <>
            {/* 功能说明 */}
            <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Mic className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-1">英语听力训练</h2>
                    <p className="text-white/80 text-sm">
                      多场景听力练习，提升听力理解能力。支持变速播放、重复聆听、答案解析。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 听力材料列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-rose-500" />
                  选择练习材料
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LISTENING_PRACTICES.map((practice) => (
                  <button
                    key={practice.id}
                    onClick={() => handleStartPractice(practice.id)}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-left"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                          <Headphones className="h-6 w-6 text-rose-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{practice.title}</h3>
                          <p className="text-sm text-muted-foreground">{practice.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {practice.count}篇
                        </Badge>
                        <p className="text-xs text-muted-foreground">{practice.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* 设置选项 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-500" />
                  播放设置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">播放速度</label>
                    <select className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800">
                      <option>1.0x 正常</option>
                      <option>0.75x 慢速</option>
                      <option>0.5x 极慢</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">重复次数</label>
                    <select className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800">
                      <option>不重复</option>
                      <option>重复1次</option>
                      <option>重复2次</option>
                      <option>无限循环</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
