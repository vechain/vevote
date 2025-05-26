export type VotedChoices = {
  proposalId: string;
  voter: string;
  choices: string[];
};

export type VotedResult = {
  data: {
    blockNumber: number;
    blockTimestamp: number;
    proposalId: string;
    choice: number;
    totalWeight: number;
    totalVoters: number;
  }[];
  pagination: {
    hasCount: boolean;
    countLimit: number;
    totalPages: number | null;
    totalElements: number | null;
    hasNext: boolean;
  };
};
