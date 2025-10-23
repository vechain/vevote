import { Delta } from "quill";
import {
  CONCLUSION_PLACEHOLDER,
  DETAILS_SPECIFICATION_PLACEHOLDER,
  GOALS_PLACEHOLDER,
  MOTIVATION_PLACEHOLDER,
  PROPOSAL_SUMMARY_PLACEHOLDER,
  REFERENCES_PLACEHOLDER,
  RISK_ANALYSIS_PLACEHOLDER,
  TODAY,
} from "./placeholders";
import { createItalicTextOp, createPlainTextOp, createSectionOps } from "./quillUtils";

export const DEFAULT_DESCRIPTION_TEMPLATE = new Delta({
  ops: [
    // Proposal Summary
    ...createSectionOps("Proposal Summary", PROPOSAL_SUMMARY_PLACEHOLDER, true),

    // Main content sections
    ...createSectionOps("Motivation", MOTIVATION_PLACEHOLDER, true),
    ...createSectionOps("Details specification", DETAILS_SPECIFICATION_PLACEHOLDER, true),
    ...createSectionOps("Goals", GOALS_PLACEHOLDER, true),
    ...createSectionOps("Risk Analysis", RISK_ANALYSIS_PLACEHOLDER, true),
    ...createSectionOps("Conclusion", CONCLUSION_PLACEHOLDER, true),
    ...createSectionOps("References", REFERENCES_PLACEHOLDER, true),

    // Separator
    createPlainTextOp("----\n\n"),

    // Date Information
    createItalicTextOp("Date:  "),
    createPlainTextOp("\n"),
    createItalicTextOp(TODAY),
    createPlainTextOp("\n"),
  ],
});
