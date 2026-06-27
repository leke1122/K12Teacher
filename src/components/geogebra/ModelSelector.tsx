'use client';

import { useState } from 'react';
import { GEO_MODELS, type GeoGebraModelConfig } from '@/lib/geogebraModels';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ModelSelectorProps {
  value?: string;
  onChange: (model: GeoGebraModelConfig) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'solid' | 'function'>('all');

  const list = filter === 'all' ? GEO_MODELS : GEO_MODELS.filter((item) => item.category === filter);

  const activeModel = list.find((item) => item.id === value) || list[0];
  if (activeModel && (!value || value !== activeModel.id)) {
    onChange(activeModel);
  }

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base flex items-center gap-2">选择模型</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'solid' | 'function')}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="solid">立体几何</TabsTrigger>
            <TabsTrigger value="function">函数</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {list.map((item) => (
            <Button
              key={item.id}
              variant={value === item.id ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => onChange(item)}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Button>
          ))}
        </div>

        {activeModel && (
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3 text-xs text-muted-foreground space-y-1">
              <p>模型说明：{activeModel.description}</p>
              <p>对应公式：{activeModel.formula}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
