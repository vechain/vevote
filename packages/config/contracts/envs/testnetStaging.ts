import { defineConfig } from "../defineConfig";
export function createTestnetStagingConfig() {
  return defineConfig({
    VITE_APP_ENV: "testnet-staging",
    CONTRACTS_ADMIN_ADDRESS: "0x5a3D02D3e3c47cc646Fac4CC463455eF6aCBbd1a",
    STARGATE_CONTRACT_ADDRESS: "0x1ec1d168574603ec35b9d229843b7c2b44bcb770", // The contract address of the VeChainNodes contract on mainnet,
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0x8bcbfc20ee39c94f4e60afc5d78c402f70b4f3b2", // The contract address of the NodeManagement contract on mainnet
    AUTHORITY_CONTRACT_ADDRESS: "0x0000000000000000000000417574686f72697479", // The contract address of the builtin Authority contract on mainnet
    QUORUM_PERCENTAGE: 5, // Quorom set to 5%
    INITIAL_MIN_VOTING_DELAY: 60480, // 1 week
    INITIAL_MAX_VOTING_DURATION: 120960, // 2 weeks
    INITIAL_MIN_VOTING_DURATION: 60480, // 1 week
    MIN_VET_STAKE: 1000000000000000000n, // Dawn (1 VET)
  });
}
