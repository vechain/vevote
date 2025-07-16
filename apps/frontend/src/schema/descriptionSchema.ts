import { LL } from "@/i18n/i18n-ssr";
import { ProposalDescription } from "@/pages/CreateProposal/CreateProposalProvider";
import {
  CONCLUSION_PLACEHOLDER,
  DETAILS_SPECIFICATION_PLACEHOLDER,
  GOALS_PLACEHOLDER,
  MOTIVATION_PLACEHOLDER,
  PROPOSAL_SUMMARY_PLACEHOLDER,
  PROPOSAL_TYPES_PLACEHOLDER,
  REFERENCES_PLACEHOLDER,
  RISK_ANALYSIS_PLACEHOLDER,
  YOUR_CONTACT_INFO_PLACEHOLDER,
  YOUR_NAME_PLACEHOLDER,
} from "@/utils/template/placeholders";
import { z } from "zod";

export const extractTextFromQuillOps = (ops: ProposalDescription[]): string => {
  return ops
    .map(op => (typeof op.insert === "string" ? op.insert : ""))
    .join("")
    .trim();
};

const PLACEHOLDER_TEXTS = [
  PROPOSAL_SUMMARY_PLACEHOLDER,
  PROPOSAL_TYPES_PLACEHOLDER.onChain,
  PROPOSAL_TYPES_PLACEHOLDER.textOnly,
  MOTIVATION_PLACEHOLDER,
  DETAILS_SPECIFICATION_PLACEHOLDER,
  GOALS_PLACEHOLDER,
  RISK_ANALYSIS_PLACEHOLDER,
  CONCLUSION_PLACEHOLDER,
  REFERENCES_PLACEHOLDER,
  YOUR_NAME_PLACEHOLDER,
  YOUR_CONTACT_INFO_PLACEHOLDER,
] as const;

export const hasPlaceholderText = (ops: ProposalDescription[]): boolean => {
  const content = extractTextFromQuillOps(ops);
  return PLACEHOLDER_TEXTS.some(placeholder => content.includes(placeholder));
};

export const hasMinimalContent = (ops: ProposalDescription[]): boolean => {
  const content = extractTextFromQuillOps(ops);
  const cleanContent = content
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*|\*|_/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanContent.length > 0;
};

export const descriptionSchema = z
  .array(z.custom<ProposalDescription>())
  .min(1, { message: LL.field_errors.required() })
  .refine(ops => hasMinimalContent(ops), {
    message: LL.field_errors.descriptions_errors.empty_description(),
  })
  .refine(ops => !hasPlaceholderText(ops), {
    message: LL.field_errors.descriptions_errors.placeholders_not_replaced(),
  });

export type DescriptionSchema = z.infer<typeof descriptionSchema>;
