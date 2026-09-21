import { z } from "zod";
const positive = z.coerce.number().finite().positive();
export const aiConfigSchema = z.object({
  AI_MODEL: z.string().trim().min(1).max(200),
  AI_INPUT_USD_PER_MILLION: positive.max(1000),
  AI_OUTPUT_USD_PER_MILLION: positive.max(1000),
  AI_MONTHLY_CAP_USD: positive.max(10000),
  AI_TIMEOUT_MS: z.coerce.number().int().min(100).max(60000).default(25000),
  AI_REQUESTS_PER_HOUR: z.coerce.number().int().min(1).max(20).default(20),
});
export function aiConfig() {
  return aiConfigSchema.parse(process.env);
}
