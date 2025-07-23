import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";

export enum CreateProposalStep {
  VOTING_DETAILS,
  VOTING_SETUP,
  VOTING_SUMMARY,
}

export enum VotingEnum {
  SINGLE_CHOICE = "SINGLE_CHOICE",
}

export enum SingleChoiceEnum {
  AGAINST = "Against",
  FOR = "For",
  ABSTAIN = "Abstain",
}

export type VotingChoices = {
  votingType: VotingEnum.SINGLE_CHOICE;
  votingOptions: SingleChoiceEnum[];
};

export type BaseOption = {
  id: string;
  value: string;
};

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
  reason?: string;
  executedProposalLink?: string;
};

export type ProposalEvent = {
  proposalId: string;
  proposer: string;
  description: string;
  startTime: string;
  voteDuration: string;
  canceller?: string;
  reason?: string;
  executedProposalLink?: string;
};

export enum ProposalState {
  PENDING,
  ACTIVE,
  CANCELED,
  DEFEATED,
  SUCCEEDED,
  EXECUTED,
}
