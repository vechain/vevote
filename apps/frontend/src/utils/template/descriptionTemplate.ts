import dayjs from "dayjs";
import { Delta } from "quill";

export const PROPOSAL_TYPES_PLACEHOLDER = {
  onChain: "[On-chain Action]",
  textOnly: "[Text-only Proposal]",
};

export const MOTIVATION_PLACEHOLDER =
  "[Explain the problem or opportunity that this proposal addresses. Why is this proposal important for VebetterDAO? What are the potential benefits?]";

export const DETAILS_SPECIFICATION_PLACEHOLDER =
  "[Provide a detailed description of the proposal. Include technical details, methodologies, and any other relevant information. Break this section into sub-sections if necessary.]";

export const GOALS_PLACEHOLDER = "[List the specific goals and outcomes you aim to achieve with this proposal.]";

export const RISK_ANALYSIS_PLACEHOLDER =
  "[Identify and assess potential risks associated with this proposal. Include mitigation strategies for each identified risk.]";

export const SUCCESS_METRICS_PLACEHOLDER =
  "[Define the metrics that will be used to measure the success of the proposal. How will you track progress and determine if the goals are met?]";

export const COMMUNITY_ENGAGEMENT_PLACEHOLDER =
  "[Describe how you plan to involve the VebetterDAO community in the proposal. How will you gather feedback and ensure that community members are informed and supportive?]";

export const CONCLUSION_PLACEHOLDER =
  "[Summarize the key points of the proposal and restate the desired outcome. Encourage community members to participate in the discussion and voting process.]";

export const REFERENCES_PLACEHOLDER = "[List any sources, documents, or links that are referenced in the proposal.]";

export const YOUR_NAME_PLACEHOLDER = "[Your Name]";

export const YOUR_CONTACT_INFO_PLACEHOLDER = "[Your Contact Information]";

export const YOUR_VECHAIN_ADDRESS_PLACEHOLDER = "0xfCf112b20Ac18DeF02ac4c006e6339d2b56Dcf3F";

export const TODAY = dayjs().format("MMM D, YYYY");

export const DEFAULT_DESCRIPTION_TEMPLATE = new Delta({
  ops: [
    {
      attributes: {
        bold: true,
      },
      insert: "## Proposal Summary",
    },
    {
      insert: "\nTest\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Proposal type",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "Specify the type of proposal:",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: PROPOSAL_TYPES_PLACEHOLDER.onChain,
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: PROPOSAL_TYPES_PLACEHOLDER.textOnly,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Motivation",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: MOTIVATION_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Details specification",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: DETAILS_SPECIFICATION_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Goals",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: GOALS_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Risk Analysis",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: RISK_ANALYSIS_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Success metrics",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: SUCCESS_METRICS_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Community engagement",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: COMMUNITY_ENGAGEMENT_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Conclusion",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: CONCLUSION_PLACEHOLDER,
    },
    {
      insert: "\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## References",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: REFERENCES_PLACEHOLDER,
    },
    {
      insert: "\n\n----\n\n",
    },
    {
      attributes: {
        bold: true,
      },
      insert: "## Author Information",
    },
    {
      insert: "\nName: ",
    },
    {
      attributes: {
        italic: true,
      },
      insert: YOUR_NAME_PLACEHOLDER,
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "Contact Information: ",
    },
    {
      attributes: {
        italic: true,
      },
      insert: YOUR_CONTACT_INFO_PLACEHOLDER,
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "Vechain address: ",
    },
    {
      attributes: {
        bold: true,
      },
      insert: YOUR_VECHAIN_ADDRESS_PLACEHOLDER,
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: "**Date:**  ",
    },
    {
      insert: "\n",
    },
    {
      attributes: {
        italic: true,
      },
      insert: TODAY,
    },
    {
      insert: "\n",
    },
  ],
});
