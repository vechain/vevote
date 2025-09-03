export type ContractType = "vevote" | "nodeManagement" | "stargate";

export const CONTRACT_CONFIGS = {
  vevote: {
    roles: [
      "DEFAULT_ADMIN_ROLE",
      "UPGRADER_ROLE",
      "WHITELIST_ADMIN_ROLE",
      "WHITELISTED_ROLE",
      "EXECUTOR_ROLE",
      "SETTINGS_MANAGER_ROLE",
      "NODE_WEIGHT_MANAGER_ROLE",
    ],
    addressKey: "vevoteContractAddress" as const,
  },
  nodeManagement: {
    roles: [
      "DEFAULT_ADMIN_ROLE",
      "UPGRADER_ROLE",
    ],
    addressKey: "nodeManagementContractAddress" as const,
  },
  stargate: {
    roles: [
      "DEFAULT_ADMIN_ROLE",
      "UPGRADER_ROLE",
      "PAUSER_ROLE",
      "LEVEL_OPERATOR_ROLE",
      "MANAGER_ROLE",
      "WHITELISTER_ROLE",
    ],
    addressKey: "stargateNFTContractAddress" as const,
  },
} as const;