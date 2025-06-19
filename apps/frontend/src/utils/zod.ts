import { z } from "zod";
import { LL } from "@/i18n/i18n-ssr";
import dayjs from "dayjs";

export const ADDRESS_LENGTH = 42;
export const requiredAddress = z
  .string()
  .length(ADDRESS_LENGTH, { message: LL.field_errors.address_length({ length: ADDRESS_LENGTH }) })
  .refine(value => value.startsWith("0x"), { message: LL.field_errors.address_starts_with_0x() });

export const requiredString = z.string().min(1, { message: LL.field_errors.required() });

export const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

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
