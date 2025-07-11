import dayjs from "dayjs";

export const PROPOSAL_TYPES_PLACEHOLDER = {
  onChain: "[On-chain Action]",
  textOnly: "[Text-only Proposal]",
};

export const PROPOSAL_SUMMARY_PLACEHOLDER =
  "[Provide a brief overview of the proposal in 2-3 sentences. This should capture the essence of what you're proposing and why it matters.]";

export const MOTIVATION_PLACEHOLDER =
  "[Explain the problem or opportunity that this proposal addresses. Why is this proposal important for VeChain? What are the potential benefits?]";

export const DETAILS_SPECIFICATION_PLACEHOLDER =
  "[Provide a detailed description of the proposal. Include technical details, methodologies, and any other relevant information. Break this section into sub-sections if necessary.]";

export const GOALS_PLACEHOLDER = "[List the specific goals and outcomes you aim to achieve with this proposal.]";

export const RISK_ANALYSIS_PLACEHOLDER =
  "[Identify and assess potential risks associated with this proposal. Include mitigation strategies for each identified risk.]";

export const CONCLUSION_PLACEHOLDER =
  "[Summarize the key points of the proposal and restate the desired outcome. Encourage community members to participate in the discussion and voting process.]";

export const REFERENCES_PLACEHOLDER =
  "[List any VIP, sources, documents, or links that are referenced in the proposal.]";

export const YOUR_NAME_PLACEHOLDER = "[Your Name]";

export const YOUR_CONTACT_INFO_PLACEHOLDER = "[Your Contact Information]";

export const TODAY = dayjs().format("MMM D, YYYY");
