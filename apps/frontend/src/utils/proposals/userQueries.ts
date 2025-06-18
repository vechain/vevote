import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../contract";
import { VeVote__factory } from "@repo/contracts";
import { NodeManagement__factory } from "@repo/contracts/typechain-types";
import { UserNode } from "@/types/user";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const nodeManagmentAddress = getConfig(import.meta.env.VITE_APP_ENV).nodeManagementContractAddress;

const contractInterface = VeVote__factory.createInterface();
const nodeManagementInterface = NodeManagement__factory.createInterface();

export const getUserRoles = async ({ address }: { address?: string }) => {
  if (!address) {
    return {
      isAdmin: false,
      isExecutor: false,
      isNodeManager: false,
      isSettingsManager: false,
      isUpgrader: false,
      isWhitelisted: false,
    };
  }
  const roleMethods = [
    { method: "DEFAULT_ADMIN_ROLE" as const, args: [] },
    { method: "UPGRADER_ROLE" as const, args: [] },
    { method: "WHITELISTED_ROLE" as const, args: [] },
    { method: "EXECUTOR_ROLE" as const, args: [] },
    { method: "SETTINGS_MANAGER_ROLE" as const, args: [] },
    { method: "NODE_WEIGHT_MANAGER_ROLE" as const, args: [] },
  ];

  const roleResults = (
    await executeMultipleClauses({ contractAddress, contractInterface, methodsWithArgs: roleMethods })
  ).map(result => (result.success ? (result.result.plain as string) : ""));

  const hasRoleMethods = roleResults.map(roleHash => {
    return { method: "hasRole" as const, args: [roleHash, address] };
  });

  const [admin, upgrader, whitelisted, executor, settingsManager, weightManager] = (
    await executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs: hasRoleMethods,
    })
  ).map(result => Boolean(result.result.plain));

  return {
    isAdmin: admin,
    isExecutor: executor,
    isNodeManager: weightManager,
    isSettingsManager: settingsManager,
    isUpgrader: upgrader,
    isWhitelisted: whitelisted,
  };
};

export const getUserNodes = async ({ address }: { address: string }) => {
  if (!address) return { nodes: [] };

  const nodesRes = await executeCall({
    contractAddress: nodeManagmentAddress,
    contractInterface: nodeManagementInterface,
    method: "getUserNodes",
    args: [address],
  });

  if (!nodesRes.success) return { nodes: [] };

  const nodesWithoutPower = nodesRes.result.plain as UserNode[];

  const methodsWithArgs = nodesWithoutPower.map(node => ({
    method: "getNodeVoteWeight" as const,
    args: [node.nodeId],
  }));

  const nodesWithPower = (
    await executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs,
    })
  ).map(result => {
    if (!result.success) return 0;
    return (result.result.plain as bigint) || BigInt(0);
  });

  const nodes = nodesWithoutPower.map((node, index) => ({
    ...node,
    votingPower: nodesWithPower[index] || BigInt(0),
  }));

  return { nodes };
};
