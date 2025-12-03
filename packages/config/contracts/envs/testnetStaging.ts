import { defineConfig } from "../defineConfig";
export function createTestnetStagingConfig() {
  return defineConfig({
    VITE_APP_ENV: "testnet-staging",
    CONTRACTS_ADMIN_ADDRESS: "0x5a3D02D3e3c47cc646Fac4CC463455eF6aCBbd1a",
    STARGATE_CONTRACT_ADDRESS: "0x887d9102f0003f1724d8fd5d4fe95a11572fcd77", // The contract address of the VeChainNodes contract on mainnet,
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xde17d0a516c38c168d37685bb71465f656aa256e", // The contract address of the NodeManagement contract on mainnet
    AUTHORITY_CONTRACT_ADDRESS: "0x0000000000000000000000417574686f72697479", // The contract address of the builtin Authority contract on mainnet
    QUORUM_PERCENTAGE: 5, // Quorom set to 5%
    INITIAL_MIN_VOTING_DELAY: 6, // 1 minute
    INITIAL_MAX_VOTING_DURATION: 120960, // 2 weeks
    INITIAL_MIN_VOTING_DURATION: 6, // 1 minute
    MIN_VET_STAKE: 10000000000000000000000n, // Dawn
    STAKER_CONTRACT_ADDRESS: "0x00000000000000000000000000005374616b6572",
  });
}
