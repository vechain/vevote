import { Delta } from "quill";
import {
  CONCLUSION_PLACEHOLDER,
  DETAILS_SPECIFICATION_PLACEHOLDER,
  GOALS_PLACEHOLDER,
  MOTIVATION_PLACEHOLDER,
  PROPOSAL_SUMMARY_PLACEHOLDER,
  PROPOSAL_TYPES_PLACEHOLDER,
  REFERENCES_PLACEHOLDER,
  RISK_ANALYSIS_PLACEHOLDER,
  TODAY,
  YOUR_CONTACT_INFO_PLACEHOLDER,
  YOUR_NAME_PLACEHOLDER,
} from "./placeholders";
import {
  createBulletListOp,
  createHeaderOp,
  createItalicTextOp,
  createPlainTextOp,
  createSectionOps,
} from "./quillUtils";

export const DEFAULT_DESCRIPTION_TEMPLATE = (accountAddress?: string) =>
  new Delta({
    ops: [
      // Proposal Summary
      ...createSectionOps("## Proposal Summary", PROPOSAL_SUMMARY_PLACEHOLDER, true),

      // Proposal Type
      createHeaderOp("## Proposal type"),
      createPlainTextOp("\n"),
      createHeaderOp("Specify the type of proposal:"),
      createPlainTextOp("\n"),
      createItalicTextOp(PROPOSAL_TYPES_PLACEHOLDER.onChain),
      createPlainTextOp("\n"),
      createItalicTextOp(PROPOSAL_TYPES_PLACEHOLDER.textOnly),
      createPlainTextOp("\n\n"),

      // Main content sections
      ...createSectionOps("## Motivation", MOTIVATION_PLACEHOLDER, true),
      ...createSectionOps("## Details specification", DETAILS_SPECIFICATION_PLACEHOLDER, true),
      ...createSectionOps("## Goals", GOALS_PLACEHOLDER, true),
      ...createSectionOps("## Risk Analysis", RISK_ANALYSIS_PLACEHOLDER, true),
      ...createSectionOps("## Conclusion", CONCLUSION_PLACEHOLDER, true),
      ...createSectionOps("## References", REFERENCES_PLACEHOLDER, true),

      // Separator
      createPlainTextOp("----\n\n"),

      // Author Information
      createHeaderOp("## Author Information"),
      createPlainTextOp("\nName: "),
      createItalicTextOp(YOUR_NAME_PLACEHOLDER),
      createBulletListOp("\n"),
      createPlainTextOp("Contact Information: "),
      createItalicTextOp(YOUR_CONTACT_INFO_PLACEHOLDER),
      createBulletListOp("\n"),
      createPlainTextOp("Vechain address: "),
      createHeaderOp(accountAddress || "Not provided"),
      createBulletListOp("\n"),
      createPlainTextOp("\n"),
      createItalicTextOp("**Date:**  "),
      createPlainTextOp("\n"),
      createItalicTextOp(TODAY),
      createPlainTextOp("\n"),
    ],
  });
