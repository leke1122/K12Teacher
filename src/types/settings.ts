export interface Settings {
  deepseekKey: string;
  qwenKey: string;
  apiProvider?: "deepseek" | "qwen" | "openai";
  defaultModel?: "deepseek" | "qwen" | "openai";
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}
