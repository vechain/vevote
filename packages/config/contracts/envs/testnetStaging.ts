import { defineConfig } from "../defineConfig";
export function createTestnetStagingConfig() {
  return defineConfig({
    VITE_APP_ENV: "testnet-staging",
    CONTRACTS_ADMIN_ADDRESS: "0x5a3D02D3e3c47cc646Fac4CC463455eF6aCBbd1a",
    STARGATE_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302", // The contract address of the VeChainNodes contract on mainnet,
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB", // The contract address of the NodeManagement contract on mainnet
    QUORUM_PERCENTAGE: 20,
    INITIAL_MIN_VOTING_DELAY: 60, // 1 minute
    INITIAL_MAX_VOTING_DURATION: 3600, // 1 hour
    INITIAL_MIN_VOTING_DURATION: 60, // 1 minute
    INITIAL_MAX_CHOICES: 32, // TODO: Update this value
    BASE_LEVEL_NODE: 10, // TODO: Update this value when new Node Staking contracts are out on mainnet
  });
}
