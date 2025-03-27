import { defineConfig } from "../defineConfig"
export function createTestnetConfig() {
  return defineConfig({
    VITE_APP_ENV: "testnet",
    CONTRACTS_ADMIN_ADDRESS: "0x5a3D02D3e3c47cc646Fac4CC463455eF6aCBbd1a",
    VECHAIN_NODES_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302", // The contract address of the VeChainNodes contract on mainnet
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB", // The contract address of the NodeManagement contract on mainnet
    QUORUM_PERCENTAGE: 20,
    INITIAL_MIN_VOTING_DELAY: 180, // 3 minutes
    INITIAL_MAX_VOTING_DURATION: 2592000, // 30 days
    INITIAL_MIN_VOTING_DURATION: 60, // 1 minute
    INITIAL_MAX_CHOICES: 32,
    BASE_LEVEL_NODE: 10,
  })
}
