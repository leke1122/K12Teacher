"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettingsStore } from "@/stores/settingsStore";
import { settingsSchema } from "@/lib/validations";
import { Settings } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AI_MODELS = [
  { id: "deepseek", name: "DeepSeek Chat", description: "高性能推理模型，适合复杂问题" },
  { id: "qwen", name: "Qwen-VL", description: "支持图片理解的多模态模型" },
] as const;

const PARAMETERS = {
  temperature: { min: 0, max: 2, step: 0.1, default: 0.7 },
  maxTokens: { min: 256, max: 8192, step: 256, default: 2048 },
} as const;

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, setSettings } = useSettingsStore();

  const form = useForm<Partial<Settings>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      deepseekKey: settings?.deepseekKey || "",
      qwenKey: settings?.qwenKey || "",
    },
  });

  useEffect(() => {
    if (open && settings) {
      form.reset({
        deepseekKey: settings.deepseekKey || "",
        qwenKey: settings.qwenKey || "",
      });
    } else if (open) {
      form.reset({
        deepseekKey: "",
        qwenKey: "",
      });
    }
  }, [open, settings, form]);

  const onSubmit = (data: Partial<Settings>) => {
    setSettings(data as Settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>⚙️ 设置</DialogTitle>
          <DialogDescription>配置 API Key 和模型参数</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api">API 配置</TabsTrigger>
              <TabsTrigger value="model">模型选择</TabsTrigger>
              <TabsTrigger value="params">参数调整</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">DeepSeek API</CardTitle>
                  <CardDescription>输入 DeepSeek API Key 用于 AI 对话功能</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="deepseekKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="deepseekKey"
                        type="password"
                        placeholder="sk-xxxxxxxxxxxxxxxx"
                        {...form.register("deepseekKey")}
                      />
                      <Button type="button" variant="outline" onClick={() => alert("测试功能请到设置页面使用")}>
                        测试
                      </Button>
                    </div>
                    {form.formState.errors.deepseekKey && (
                      <p className="text-sm text-destructive">{form.formState.errors.deepseekKey.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Qwen-VL API</CardTitle>
                  <CardDescription>输入通义千问 VL API Key 用于图片识别</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="qwenKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="qwenKey"
                        type="password"
                        placeholder="sk-xxxxxxxxxxxxxxxx"
                        {...form.register("qwenKey")}
                      />
                      <Button type="button" variant="outline" onClick={() => alert("测试功能请到设置页面使用")}>
                        测试
                      </Button>
                    </div>
                    {form.formState.errors.qwenKey && (
                      <p className="text-sm text-destructive">{form.formState.errors.qwenKey.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="model" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>选择默认 AI 模型</CardTitle>
                  <CardDescription>不同模型有不同的能力特点</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {AI_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                        "hover:border-primary/50",
                        settings?.defaultModel === model.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => {
                        useSettingsStore.getState().updateSetting?.("defaultModel", model.id);
                      }}
                    >
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center",
                          settings?.defaultModel === model.id ? "border-primary bg-primary" : "border-muted-foreground"
                        )}
                      >
                        {settings?.defaultModel === model.id && <div className="w-2 h-2 rounded-full bg-background" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="params" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>模型参数</CardTitle>
                  <CardDescription>调整 AI 生成内容的随机性和长度限制</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Temperature</Label>
                      <span className="text-sm text-muted-foreground">
                        {settings?.temperature ?? PARAMETERS.temperature.default}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={PARAMETERS.temperature.min}
                      max={PARAMETERS.temperature.max}
                      step={PARAMETERS.temperature.step}
                      value={settings?.temperature ?? PARAMETERS.temperature.default}
                      onChange={(e) => {
                        useSettingsStore.getState().updateSetting?.("temperature", parseFloat(e.target.value));
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>精确</span>
                      <span>创意</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Max Tokens</Label>
                      <span className="text-sm text-muted-foreground">
                        {settings?.maxTokens ?? PARAMETERS.maxTokens.default}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={PARAMETERS.maxTokens.min}
                      max={PARAMETERS.maxTokens.max}
                      step={PARAMETERS.maxTokens.step}
                      value={settings?.maxTokens ?? PARAMETERS.maxTokens.default}
                      onChange={(e) => {
                        useSettingsStore.getState().updateSetting?.("maxTokens", parseInt(e.target.value));
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>简短回答</span>
                      <span>详细回答</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>流式输出</Label>
                      <p className="text-sm text-muted-foreground">实时显示 AI 生成内容</p>
                    </div>
                    <Switch
                      checked={settings?.streaming ?? true}
                      onCheckedChange={(checked) => {
                        useSettingsStore.getState().updateSetting?.("streaming", checked);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">保存配置</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
