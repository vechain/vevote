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
