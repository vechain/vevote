import { LL } from "@/i18n/i18n-ssr";
import { ProposalDescription } from "@/pages/CreateProposal/CreateProposalProvider";
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
