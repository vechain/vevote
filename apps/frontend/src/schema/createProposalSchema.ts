import { LL } from "@/i18n/i18n-ssr";
import { ProposalDescription } from "@/pages/CreateProposal/CreateProposalProvider";
import { SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { zodFile, zodStartEndDates } from "@/utils/zod";
import { z } from "zod";

export const TITLE_MAX_CHARS = 60;

export const proposalDetailsSchema = z
  .object({
    title: z.string().min(1, { message: LL.field_errors.required() }).max(TITLE_MAX_CHARS),
    description: z.array(z.custom<ProposalDescription>()).min(1, { message: LL.field_errors.required() }),
    headerImage: zodFile,
  })
  .and(zodStartEndDates);

export type ProposalDetailsSchema = z.infer<typeof proposalDetailsSchema>;

const proposalSingleChoiceSchema = z.object({
  votingType: z.literal(VotingEnum.SINGLE_CHOICE),
  votingQuestion: z.string().min(1),
  votingOptions: z.array(z.nativeEnum(SingleChoiceEnum)),
});

const baseOptions = z.object({
  votingQuestion: z.string().min(1),
  votingLimit: z.number(),
  votingOptions: z.array(z.string()),
});

const proposalSingleOptionSchema = baseOptions.extend({
  votingType: z.literal(VotingEnum.SINGLE_OPTION),
});

const proposalMultipleOptionSchema = baseOptions.extend({
  votingType: z.literal(VotingEnum.MULTIPLE_OPTIONS),
});

export const proposalSetupSchema = z.discriminatedUnion("votingType", [
  proposalSingleChoiceSchema,
  proposalSingleOptionSchema,
  proposalMultipleOptionSchema,
]);

export type ProposalSetupSchema = z.infer<typeof proposalSetupSchema>;
