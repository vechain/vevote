export interface UpgradeContract {
  name: string;
  configAddressField: string;
  versions: readonly string[];
  descriptions: Record<string, string>;
}

export const upgradeConfig: Record<string, UpgradeContract> = {
  VeVote: {
    name: "vevote",
    configAddressField: "vevoteContractAddress",
    versions: ["v1"],
    descriptions: {
      v1: "Upgrade VeVote contract",
    },
  },
} as const;
