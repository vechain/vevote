export type VotedChoices = {
  proposalId: string;
  voter: string;
  choices: string[];
};

export type VotedBaseData = {
  blockNumber: number;
  blockTimestamp: number;
  proposalId: string;
};

export type Pagination = {
  hasCount: boolean;
  countLimit: number;
  totalPages: number | null;
  totalElements: number | null;
  hasNext: boolean;
};

export type VotedResult = {
  data: (VotedBaseData & {
    support: "ABSTAIN" | "AGAINST" | "FOR";
    totalWeight: number;
    totalVoters: number;
  })[];
  pagination: Pagination;
};

export type VotesCastResult = {
  proposalId: string;
  voter: string;
  choice: 0 | 1 | 2;
  weight: string;
  reason: string;
  stargateNFTs: string[];
  validator: string;
  date: Date;
  transactionId: string;
};

export type VotedComments = {
  data: VotedBaseData &
    {
      choices: number[];
      weight: number;
      reason: string;
    }[];
  pagination: Pagination;
};
