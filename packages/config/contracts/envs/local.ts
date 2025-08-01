import { defineConfig } from "../defineConfig";

export function createLocalConfig() {
  return defineConfig({
    VITE_APP_ENV: "local",
    CONTRACTS_ADMIN_ADDRESS: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
    STARGATE_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302", // The contract address of the VeChainNodes contract on mainnet
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB", // The contract address of the NodeManagement contract on mainnet
    AUTHORITY_CONTRACT_ADDRESS: "0x0000000000000000000000417574686f72697479", // The contract address of the builtin Authority contract on mainnet
    QUORUM_PERCENTAGE: 20,
    INITIAL_MIN_VOTING_DELAY: 1, // 1 block
    INITIAL_MAX_VOTING_DURATION: 10, // 10 blocks
    INITIAL_MIN_VOTING_DURATION: 1, // 1 block
    MIN_VET_STAKE: 10000000000000000000000n, // Dawn
  });
}
