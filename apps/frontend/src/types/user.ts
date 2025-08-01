export type NodeItem = {
  multiplier: number;
  nodeName: string;
  votingPower: number;
  count: number;
};

export enum UserRoles {
  ADMIN,
  UPGRADER_ROLE,
  WHITELISTED_ROLE,
  EXECUTOR_ROLE,
  SETTINGS_MANAGER_ROLE,
  NODE_WEIGHT_MANAGER_ROLE,
}

export type UserNode = {
  nodeId: bigint;
  nodeLevel: number;
  xNodeOwner: string;
  isXNodeHolder: boolean;
  isXNodeDelegator: boolean;
  isXNodeDelegatee: boolean;
  isXNodeDelegated: boolean;
  delegatee: string;
};

export type ExtendedUserNode = UserNode & {
  votingPower: bigint;
  multiplier: bigint;
  nodeName: NodeStrengthLevel;
};

export type StargateNode = {
  lastVthoClaimTimestamp: number;
  levelId: number;
  mintedAtBlock: bigint;
  tokenId: bigint;
  vetAmountStaked: bigint;
};

export type ExtendedStargateNode = StargateNode & {
  votingPower: bigint;
  multiplier: bigint;
  nodeName: NodeStrengthLevel;
};

export type GroupedExtendedStargateNode = ExtendedStargateNode & {
  count: number;
};

export enum NodeStrengthLevel {
  None = "none",
  Strength = "strength",
  Thunder = "thunder",
  Mjolnir = "mjolnir",
  VeThorX = "vethorx",
  StrengthX = "strengthx",
  ThunderX = "thunderx",
  MjolnirX = "mjolnirx",
  Flash = "flash",
  Lightning = "lightning",
  Dawn = "dawn",
  Validator = "validator",
}

export const NodeStrengthLevels: NodeStrengthLevel[] = [
  NodeStrengthLevel.None,
  NodeStrengthLevel.Strength,
  NodeStrengthLevel.Thunder,
  NodeStrengthLevel.Mjolnir,
  NodeStrengthLevel.VeThorX,
  NodeStrengthLevel.StrengthX,
  NodeStrengthLevel.ThunderX,
  NodeStrengthLevel.MjolnirX,
  NodeStrengthLevel.Flash,
  NodeStrengthLevel.Lightning,
  NodeStrengthLevel.Dawn,
  NodeStrengthLevel.Validator,
];

export type AmnResponse = {
  nodeMaster: string;
  endorser: string;
};
