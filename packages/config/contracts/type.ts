export type ContractsConfig = {
  VITE_APP_ENV: "local" | "e2e" | "testnet" | "mainnet" | "testnet-staging" | "galactica-test";
  CONTRACTS_ADMIN_ADDRESS: string;
  STARGATE_CONTRACT_ADDRESS: string;
  NODE_MANAGEMENT_CONTRACT_ADDRESS: string;
  AUTHORITY_CONTRACT_ADDRESS: string;
  QUORUM_PERCENTAGE: number;
  INITIAL_MIN_VOTING_DELAY: number;
  INITIAL_MAX_VOTING_DURATION: number;
  INITIAL_MIN_VOTING_DURATION: number;
  INITIAL_MAX_CHOICES: number;
  MIN_VET_STAKE: bigint;
};
