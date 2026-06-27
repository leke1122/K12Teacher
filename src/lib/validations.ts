import { z } from 'zod';

export const settingsSchema = z.object({
  deepseekKey: z.string().min(1, '请输入 DeepSeek API Key'),
  qwenKey: z.string().optional().or(z.literal('')),
});
