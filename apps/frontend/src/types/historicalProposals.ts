import { ProposalCardType } from "./proposal";

export type HistoricalProposalData = {
  id: string;
  proposalId: string;
  createdDate: string; //timestamp
  proposer: string;
  title: string;
  proposalType: string | null;
  choices: string[];
  createTime: number;
  votingStartTime: number;
  votingEndTime: number;
  voteTallies: number[];
  totalVotes: number;
  blockId: string;
  blockNumber: number;
  blockTimestamp: number;
};

export type HistoricalProposalResponse = {
  data: HistoricalProposalData[];
  pagination: {
    hasCount: boolean;
    countLimit: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
  };
};

export type HistoricalProposalMerged = ProposalCardType & {
  choicesWithVote?: {
    choice: string;
    votes: number;
    percentage: number;
  }[];
  totalVotes?: number;
};

export type MergedProposal = ProposalCardType | HistoricalProposalMerged;
