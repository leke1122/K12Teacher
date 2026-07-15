'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Level = {
  id: string;
  name: string;
  detail: string;
  children?: Level[];
};

const LEVELS: Level[] = [
  {
    id: 'universe',
    name: '可观测宇宙',
    detail: '包含数百亿星系，是人类目前可观测的最大尺度。',
    children: [
      {
        id: 'galaxy',
        name: '银河系',
        detail: '包含太阳系在内的棒旋星系，直径约10万光年。',
        children: [
          {
            id: 'solar',
            name: '太阳系',
            detail: '由太阳和八大行星等天体组成，位于银河系猎户臂。',
            children: [
              { id: 'earth-moon', name: '地月系', detail: '地球与月球组成的天体系统，月球是地球唯一的天然卫星。' },
            ],
          },
        ],
      },
    ],
  },
];

function TreeNode({ node, depth }: { node: Level; depth: number }) {
  const [open, setOpen] = useState(depth === 0);
  return (
    <div className="ml-0" style={{ marginLeft: depth * 12 }}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>{open ? '-' : '+'}</Button>
        <span className="font-medium text-slate-800">{node.name}</span>
      </div>
      {open && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-slate-600">{node.detail}</p>
          {node.children?.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SolarSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/knowledge/compulsory-1">
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">🌌 天体系统层级图</h1>
        </div>
        <Card>
          <CardContent className="p-4">
            {LEVELS.map(node => <TreeNode key={node.id} node={node} depth={0} />)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
