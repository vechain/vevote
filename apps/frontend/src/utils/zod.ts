import { z } from "zod";
import { LL } from "@/i18n/i18n-ssr";

export const requiredString = z.string().min(1, { message: LL.field_errors.required() });

export const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

export const zodStartEndDates = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    if (data.startDate >= data.endDate)
      ctx.addIssue({
        code: "custom",
        message: LL.field_errors.end_before_start(),
        path: ["endDate"],
      });
    else if (data.startDate <= today)
      ctx.addIssue({
        code: "custom",
        message: LL.field_errors.start_after_today(),
        path: ["startDate"],
      });
  });

export const zodFile = z.object({
  type: z.string(),
  name: z.string(),
  size: z.number().int(),
  source: z.any().optional(),
  url: z.string(),
});

export type ZodFile = z.infer<typeof zodFile>;
