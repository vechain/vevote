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
  votingPower: bigint;
};
