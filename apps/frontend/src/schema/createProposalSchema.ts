import { LL } from "@/i18n/i18n-ssr";
import { zodFile, zodStartEndDates, discourseTopic } from "@/utils/zod";
import { z } from "zod";
import { descriptionSchema } from "./descriptionSchema";

export const TITLE_MAX_CHARS = 120;
export const QUESTION_MAX_CHAR = 120;

export const proposalDetailsSchema = (delay: number, duration: number) =>
  z
    .object({
      title: z.string().trim().min(1, { message: LL.field_errors.required() }).max(TITLE_MAX_CHARS),
      description: descriptionSchema,
      headerImage: zodFile.optional(),
      discourseUrl: discourseTopic,
    })
    .and(zodStartEndDates(delay, duration));

export type ProposalDetailsSchema = z.infer<ReturnType<typeof proposalDetailsSchema>>;

export const proposalSingleChoiceSchema = z.object({
  votingQuestion: z.string().trim().min(1, { message: LL.field_errors.required() }).max(QUESTION_MAX_CHAR),
});

export const proposalSetupSchema = proposalSingleChoiceSchema;
export type ProposalSingleChoiceSchema = z.infer<typeof proposalSingleChoiceSchema>;
export type ProposalSetupSchema = z.infer<typeof proposalSetupSchema>;
