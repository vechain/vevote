export enum IndexerRoutes {
  RESULTS = "/vevote/proposal/results",
  PROPOSAL = "/vevote/proposals/comments",
  MASTER_NODE = "/validators?endorser=",
  HISTORIC_PROPOSALS = "/vevote/historic-proposals",
}

export interface ValidatorEntry {
  id: string;
  endorser: string;
  beneficiary: string;
  status: string;
}

export interface ValidatorsResponse {
  data: ValidatorEntry[];
  pagination?: {
    hasCount: boolean;
    countLimit: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
  };
}
