import { z } from "zod";
import { LL } from "@/i18n/i18n-ssr";

export const requiredString = z.string().min(1, { message: LL.field_errors.required() });

export const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

export const zodFile = z.object({
  type: z.string(),
  name: z.string(),
  size: z.number().int(),
  source: z.any().optional(),
  url: z.string(),
});

export type ZodFile = z.infer<typeof zodFile>;
