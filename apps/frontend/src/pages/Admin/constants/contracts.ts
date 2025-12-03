export type ContractType = "vevote";

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
} as const;
