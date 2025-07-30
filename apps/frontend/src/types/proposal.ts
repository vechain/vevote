import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { VotesCastResult } from "./votes";

export enum CreateProposalStep {
  VOTING_DETAILS,
  VOTING_SETUP,
  VOTING_SUMMARY,
}

export enum SingleChoiceEnum {
  AGAINST = "Against",
  FOR = "For",
  ABSTAIN = "Abstain",
}

export type ProposalStatus =
  | "draft"
  | "upcoming"
  | "voting"
  | "approved"
  | "executed"
  | "canceled"
  | "rejected"
  | "min-not-reached";

export type FilterStatuses = Omit<ProposalStatus, "min-not-reached">;

export type ProposalCardType = ProposalDetails & {
  id: string;
  status: ProposalStatus;
  proposer: string;
  createdAt: Date;
  reason?: string;
  results?: VotesCastResult[];
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
