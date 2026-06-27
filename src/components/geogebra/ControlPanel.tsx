'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GeoGebraModelConfig } from '@/lib/geogebraModels';

interface ControlPanelProps {
  model: GeoGebraModelConfig;
  params: Record<string, number>;
  onParamsChange: (next: Record<string, number>) => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
}

export function ControlPanel({
  model,
  params,
  onParamsChange,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onReset,
}: ControlPanelProps) {
  const [showAuxiliaryLines, setShowAuxiliaryLines] = useState(false);

  const paramKeys = Object.keys(model.defaultParams);

  const handleSliderChange = (key: string, value: number[]) => {
    const next = { ...params, [key]: value[0] };
    onParamsChange(next);
  };

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base flex items-center gap-2">控制面板</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onRotateLeft}>向左旋转</Button>
            <Button variant="outline" size="sm" onClick={onRotateRight}>向右旋转</Button>
            <Button variant="outline" size="sm" onClick={onZoomIn}>放大</Button>
            <Button variant="outline" size="sm" onClick={onZoomOut}>缩小</Button>
          </div>
          <Button variant="secondary" size="sm" onClick={onReset}>重置视图</Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-white p-3">
          <div className="space-y-1">
            <Label className="text-sm font-medium">显示辅助线 / 坐标轴</Label>
            <p className="text-xs text-muted-foreground">适用于立体几何观察</p>
          </div>
          <Switch checked={showAuxiliaryLines} onCheckedChange={setShowAuxiliaryLines} />
        </div>

        {paramKeys.length > 0 && (
          <div className="space-y-3 rounded-lg border bg-white p-3">
            <p className="text-sm font-medium">参数调节</p>
            {paramKeys.map((key) => {
              const value = params[key];
              const displayValue =
                value == null ? '—' : Number.isInteger(value) ? value : typeof value === 'number' ? value.toFixed(2) : String(value);

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{key}</span>
                    <span className="text-muted-foreground">{displayValue}</span>
                  </div>
                  <Slider
                    value={[value ?? 0]}
                    min={model.defaultParams[key] ? model.defaultParams[key] * 0.2 : 0.5}
                    max={model.defaultParams[key] ? model.defaultParams[key] * 3 : 10}
                    step={0.1}
                    onValueChange={(v) => handleSliderChange(key, v)}
                  />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">当前公式：{model.formula}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
