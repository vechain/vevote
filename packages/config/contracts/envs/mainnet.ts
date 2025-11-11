import { defineConfig } from "../defineConfig";
export function createMainnetConfig() {
  return defineConfig({
    VITE_APP_ENV: "mainnet",
    CONTRACTS_ADMIN_ADDRESS: "0x6b27a8cf77eAA257286e11506845044f894be917",
    STARGATE_CONTRACT_ADDRESS: "0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7", // The contract address of the VeChainNodes contract on mainnet,
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB", // The contract address of the NodeManagement contract on mainnet
    AUTHORITY_CONTRACT_ADDRESS: "0x0000000000000000000000417574686f72697479", // The contract address of the builtin Authority contract on mainnet
    QUORUM_PERCENTAGE: 5, // Quorom set to 5%
    INITIAL_MIN_VOTING_DELAY: 60480, // 1 week
    INITIAL_MAX_VOTING_DURATION: 120960, // 2 weeks
    INITIAL_MIN_VOTING_DURATION: 60480, // 1 week
    MIN_VET_STAKE: 10000000000000000000000n, // Dawn
    STAKER_CONTRACT_ADDRESS: "0x00000000000000000000000000005374616b6572",
  });
}
