import { defineConfig } from "../defineConfig";
export function createTestnetStagingConfig() {
  return defineConfig({
    VITE_APP_ENV: "testnet-staging",
    CONTRACTS_ADMIN_ADDRESS: "0x5a3D02D3e3c47cc646Fac4CC463455eF6aCBbd1a",
    STARGATE_CONTRACT_ADDRESS: "0xab65a879185010a59c9c24679e5f1be17ce358c7", // The contract address of the VeChainNodes contract on mainnet,
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0x2e970bafffd05d7ececabbdfcfd0866f37278917", // The contract address of the NodeManagement contract on mainnet
    AUTHORITY_CONTRACT_ADDRESS: "0x0000000000000000000000417574686f72697479", // The contract address of the builtin Authority contract on mainnet
    QUORUM_PERCENTAGE: 5, // Quorom set to 5%
    INITIAL_MIN_VOTING_DELAY: 6, // 1 minute
    INITIAL_MAX_VOTING_DURATION: 120960, // 2 weeks
    INITIAL_MIN_VOTING_DURATION: 6, // 1 minute
    MIN_VET_STAKE: 10000000000000000000000n, // Dawn
    STAKER_CONTRACT_ADDRESS: "0x00000000000000000000000000005374616b6572",
  });
}
