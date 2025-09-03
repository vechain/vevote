import { z } from "zod";
import { LL } from "@/i18n/i18n-ssr";
import dayjs from "dayjs";
import { validateDiscourseTopicExists } from "./discourse";

export const requiredString = z.string().min(1, { message: LL.field_errors.required() });

export const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

export const discourseTopic = z
  .string()
  .trim()
  .min(1, { message: LL.field_errors.required() })
  .refine(
    async value => {
      if (!value) return true;
      const result = await validateDiscourseTopicExists(value);
      return result;
    },
    {
      message: LL.field_errors.discourse_topic_not_exist(),
    },
  );

export const zodStartEndDates = (delay: number, duration: number) =>
  z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .superRefine((data, ctx) => {
      const today = dayjs().add(delay, "seconds").toDate();
      const endDate = dayjs(data.startDate).add(duration, "seconds").toDate();

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
      else if (data.endDate > endDate)
        ctx.addIssue({
          code: "custom",
          message: LL.field_errors.end_after_max_duration({ days: `${dayjs(endDate).diff(data.startDate, "day")}` }),
          path: ["endDate"],
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

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const addressSchema = z.string().trim().min(1, { message: LL.field_errors.required() }).refine(isValidAddress, {
  message: LL.field_errors.invalid_address(),
});
