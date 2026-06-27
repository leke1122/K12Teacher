'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HistoryKnowledgePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/subjects/history">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">知识点学习</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">知识点学习功能开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}
