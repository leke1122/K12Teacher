'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ExtendedReadingItem {
  id: string;
  title: string;
  category: string;
  content: string;
  examAngles: string[];
}

export default function PoliticsExtendedReadingPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExtendedReadingItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/politics/extended-reading?unitId=${encodeURIComponent('politics_unit1')}`);
        const json = await res.json();
        if (json.success) setItems(json.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chapterId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-pink-500" />
              延展阅读
            </h1>
            <p className="text-xs text-slate-500">📝 基于导入知识点延伸</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在加载延展阅读...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{item.title}</span>
                    <Badge variant="outline">{item.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p className="whitespace-pre-wrap leading-relaxed">{item.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.examAngles.map(angle => (
                      <span key={angle} className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">{angle}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
