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

export type CustomChoiceOptions =
  | {
      votingType: VotingEnum.SINGLE_OPTION;
      votingOptions: BaseOption[];
    }
  | {
      votingType: VotingEnum.MULTIPLE_OPTIONS;
      votingOptions: BaseOption[];
    };

export type VotingChoices = SingleChoiceOptions | CustomChoiceOptions;

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
  choices: string[];
  maxSelection: number;
  minSelection: number;
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
