import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../contract";
import { VeVote__factory } from "@repo/contracts";
import { NodeManagement__factory } from "@repo/contracts/typechain-types";
import { ExtendedUserNode, NodeStrengthLevels, UserNode } from "@/types/user";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const nodeManagementAddress = getConfig(import.meta.env.VITE_APP_ENV).nodeManagementContractAddress;

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

export const getUserNodes = async ({ address, blockN }: { address: string; blockN: string }) => {
  try {
    const nodesRes = await executeCall({
      contractAddress: nodeManagementAddress,
      contractInterface: nodeManagementInterface,
      method: "getUserNodes",
      args: [address],
      callOptions: {
        revision: blockN,
      },
    });

    if (!nodesRes.success) return { nodes: [] };

    const userNodes = nodesRes.result.plain as UserNode[];

    const votingPowerArgs = userNodes.map(node => ({
      method: "getNodeVoteWeight" as const,
      args: [node.nodeId],
    }));

    const multiplierArgs = userNodes.map(node => ({
      method: "levelIdMultiplier" as const,
      args: [node.nodeLevel],
    }));

    const [nodesPower, nodesMultiplier] = await Promise.all([
      executeMultipleClauses({
        contractAddress,
        contractInterface,
        methodsWithArgs: votingPowerArgs,
      }),
      executeMultipleClauses({
        contractAddress,
        contractInterface,
        methodsWithArgs: multiplierArgs,
      }),
    ]);

    const nodesPowerResults = nodesPower.map(r => (r.success ? (r.result.plain as bigint) : BigInt(0)));
    const nodesMultiplierResults = nodesMultiplier.map(r => (r.success ? (r.result.plain as bigint) : BigInt(0)));

    const nodes: ExtendedUserNode[] = userNodes.map((node, index) => ({
      ...node,
      multiplier: nodesMultiplierResults[index] || BigInt(0),
      nodeName: NodeStrengthLevels[node.nodeLevel],
      votingPower: nodesPowerResults[index] || BigInt(0),
    }));

    return { nodes };
  } catch (error) {
    console.error("Error fetching user nodes:", error);
  }
};

export const getNodesName = async ({ nodeIds }: { nodeIds: string[] }) => {
  const res = await executeMultipleClauses({
    contractAddress: nodeManagementAddress,
    contractInterface: nodeManagementInterface,
    methodsWithArgs: nodeIds.map(nodeId => ({
      method: "getNodeLevel" as const,
      args: [nodeId],
    })),
  });

  const nodeLevels = res.map((result, id) => ({
    id: nodeIds[id],
    name: result.success ? NodeStrengthLevels[result.result.plain as number] : "Unknown",
  }));

  return nodeLevels;
};
