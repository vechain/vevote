import { LL } from "@/i18n/i18n-ssr";
import { SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { zodFile, zodStartEndDates } from "@/utils/zod";
import { z } from "zod";
import { descriptionSchema } from "./descriptionSchema";

export const TITLE_MAX_CHARS = 120;
export const QUESTION_MAX_CHAR = 120;

export const proposalDetailsSchema = (delay: number, duration: number) =>
  z
    .object({
      title: z.string().min(1, { message: LL.field_errors.required() }).max(TITLE_MAX_CHARS),
      description: descriptionSchema,
      headerImage: zodFile,
    })
    .and(zodStartEndDates(delay, duration));

export type ProposalDetailsSchema = z.infer<ReturnType<typeof proposalDetailsSchema>>;

export const proposalSingleChoiceSchema = z.object({
  votingType: z.literal(VotingEnum.SINGLE_CHOICE),
  votingQuestion: z.string().min(1, { message: LL.field_errors.required() }).max(QUESTION_MAX_CHAR),
  votingOptions: z.array(z.nativeEnum(SingleChoiceEnum)),
});

export const proposalSingleOptionSchema = z.object({
  votingQuestion: z.string().min(1, { message: LL.field_errors.required() }).max(QUESTION_MAX_CHAR),
  votingOptions: z
    .object({
      id: z.string(),
      value: z.string().min(1, { message: "" }),
    })
    .array(),
  votingType: z.literal(VotingEnum.SINGLE_OPTION),
});

export const proposalMultipleOptionSchema = z.object({
  votingQuestion: z.string().min(1, { message: LL.field_errors.required() }).max(QUESTION_MAX_CHAR),
  votingOptions: z
    .object({
      id: z.string(),
      value: z.string().min(1, { message: "" }),
    })
    .array(),
  votingType: z.literal(VotingEnum.MULTIPLE_OPTIONS),
  votingLimit: z.number(),
  votingMin: z.number().min(1),
});

export const proposalSetupSchema = z.discriminatedUnion("votingType", [
  proposalSingleChoiceSchema,
  proposalSingleOptionSchema,
  proposalMultipleOptionSchema,
]);
export type ProposalSingleChoiceSchema = z.infer<typeof proposalSingleChoiceSchema>;
export type ProposalSingleOptionSchema = z.infer<typeof proposalSingleOptionSchema>;
export type ProposalMultipleOptionSchema = z.infer<typeof proposalMultipleOptionSchema>;

export type ProposalSetupSchema = z.infer<typeof proposalSetupSchema>;
