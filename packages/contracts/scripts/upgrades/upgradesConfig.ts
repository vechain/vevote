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
    versions: ["v1", "v2"],
    descriptions: {
      v1: "Upgrade VeVote contract",
      v2: "Upgrade VeVote contract to version 2 (Hayabusa)",
    },
  },
} as const;
