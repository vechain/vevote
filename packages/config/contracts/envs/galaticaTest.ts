import { defineConfig } from "../defineConfig";
export function createGalacticaTestConfig() {
  return defineConfig({
    VITE_APP_ENV: "galactica-test",
    CONTRACTS_ADMIN_ADDRESS: "0x5a3D02D3e3c47cc646Fac4CC463455eF6aCBbd1a",
    STARGATE_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302", // The contract address of the VeChainNodes contract on mainnet
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB", // The contract address of the NodeManagement contract on mainnet
    AUTHORITY_CONTRACT_ADDRESS: "0x0000000000000000000000417574686f72697479", // The contract address of the builtin Authority contract on mainnet
    QUORUM_PERCENTAGE: 20,
    INITIAL_MIN_VOTING_DELAY: 18, // 3 minutes
    INITIAL_MAX_VOTING_DURATION: 259200, // 30 days
    INITIAL_MIN_VOTING_DURATION: 6, // 1 minute
    MIN_VET_STAKE: 10000000000000000000000n, // Dawn
  });
}
