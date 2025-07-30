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

export enum ProposalStatus {
  DRAFT = "draft",
  UPCOMING = "upcoming",
  VOTING = "voting",
  APPROVED = "approved",
  EXECUTED = "executed",
  CANCELED = "canceled",
  REJECTED = "rejected",
  MIN_NOT_REACHED = "min-not-reached",
}

export type FilterStatuses = Omit<ProposalStatus, "min-not-reached">;

export type ProposalCardType = ProposalDetails & {
  id: string;
  status: ProposalStatus;
  proposer: string;
  createdAt: Date;
  reason?: string;
  results?: VotesCastResult[];
  executedProposalLink?: string;
  canceledDate?: Date;
  executedDate?: Date;
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
  canceledTime?: string;
  executedTime?: string;
  createdTime?: string;
};

export enum ProposalState {
  PENDING,
  ACTIVE,
  CANCELED,
  DEFEATED,
  SUCCEEDED,
  EXECUTED,
}
