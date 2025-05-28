import { defineConfig } from "../defineConfig";
export function createMainnetConfig() {
  return defineConfig({
    VITE_APP_ENV: "mainnet",
    CONTRACTS_ADMIN_ADDRESS: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
    STARGATE_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302", // The contract address of the VeChainNodes contract on mainnet,
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB", // The contract address of the NodeManagement contract on mainnet
    QUORUM_PERCENTAGE: 20,
    INITIAL_MIN_VOTING_DELAY: 604800, // 1 week
    INITIAL_MAX_VOTING_DURATION: 2592000, // 30 days
    INITIAL_MIN_VOTING_DURATION: 604800, // 1 week
    INITIAL_MAX_CHOICES: 32, // TODO: Update this value
    BASE_LEVEL_NODE: 1, // TODO: Update this value when new Node Staking contracts are out on mainnet
  });
}
