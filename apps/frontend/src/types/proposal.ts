import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";

export enum CreateProposalStep {
  VOTING_DETAILS,
  VOTING_SETUP,
  VOTING_SUMMARY,
}

export enum VotingEnum {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  SINGLE_OPTION = "SINGLE_OPTION",
  MULTIPLE_OPTIONS = "MULTIPLE_OPTIONS",
}

export enum SingleChoiceEnum {
  YES = "Yes",
  NO = "No",
  ABSTAIN = "Abstain",
}

export type SingleChoiceOptions = {
  votingType: VotingEnum.SINGLE_CHOICE;
  votingOptions: SingleChoiceEnum[];
};

export type BaseOption = {
  id: string;
  value: string;
};

export type VotingChoices =
  | { votingType: VotingEnum.SINGLE_CHOICE; votingOptions: SingleChoiceEnum[] }
  | { votingType: VotingEnum.SINGLE_OPTION; votingOptions: BaseOption[] }
  | { votingType: VotingEnum.MULTIPLE_OPTIONS; votingOptions: BaseOption[] };

export type ProposalStatus =
  | "draft"
  | "upcoming"
  | "voting"
  | "approved"
  | "executed"
  | "canceled"
  | "rejected"
  | "min-not-reached";

export type ProposalCardType = ProposalDetails & {
  id: string;
  status: ProposalStatus;
  proposer: string;
  createdAt: Date;
};
