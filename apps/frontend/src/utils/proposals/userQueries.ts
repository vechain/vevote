import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../contract";
import { VeVote__factory } from "@repo/contracts";
import { NodeManagement__factory } from "@repo/contracts/typechain-types";
import { AmnResponse, ExtendedStargateNode, NodeStrengthLevels, StargateNode } from "@/types/user";
import axios from "axios";
import { IndexerRoutes } from "@/types/indexer";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const nodeManagementAddress = getConfig(import.meta.env.VITE_APP_ENV).nodeManagementContractAddress;
const indexerUrl = getConfig(import.meta.env.VITE_APP_ENV).indexerUrl;

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
  try {
    const nodesRes = await executeCall({
      contractAddress: nodeManagementAddress,
      contractInterface: nodeManagementInterface,
      method: "getUserStargateNFTsInfo",
      args: [address],
    });

    if (!nodesRes.success) return { nodes: [] };

    const userNodes = nodesRes.result.plain as StargateNode[];

    const votingPowerArgs = userNodes.map(node => ({
      method: "getNodeVoteWeight" as const,
      args: [node.tokenId],
    }));

    const nodesPower = await executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs: votingPowerArgs,
    });

    const nodesPowerResults = nodesPower.map(r => (r.success ? (r.result.plain as bigint) : BigInt(0)));

    const nodes: ExtendedStargateNode[] = userNodes.map((node, index) => ({
      ...node,
      nodeName: NodeStrengthLevels[node.levelId],
      votingPower: nodesPowerResults[index] || BigInt(0),
    }));

    return { nodes };
  } catch (error) {
    console.error("Error fetching user nodes:", error);
  }
};

export const getNodesNameAndPower = async ({ nodeIds }: { nodeIds: string[] }) => {
  const votingPowerArgs = nodeIds.map(node => ({
    method: "getNodeVoteWeight" as const,
    args: [node],
  }));
  const nodeLevelArgs = nodeIds.map(node => ({
    method: "getNodeLevel" as const,
    args: [node],
  }));

  const [nodesPower, nodesLevel] = await Promise.all([
    executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs: votingPowerArgs,
    }),
    executeMultipleClauses({
      contractAddress: nodeManagementAddress,
      contractInterface: nodeManagementInterface,
      methodsWithArgs: nodeLevelArgs,
    }),
  ]);

  const power = nodesPower.map(r => (r.success ? (r.result.plain as bigint) : BigInt(0)));
  const levels = nodesLevel.map(r => (r.success ? (r.result.plain as number) : 0));

  return nodeIds.map((nodeId, index) => ({
    id: nodeId,
    votingPower: Number(power[index]) / 100 || 0,
    name: NodeStrengthLevels[levels[index]],
  }));
};

export const getAMN = async (address?: string) => {
  if (!address) return { data: undefined };
  try {
    let res;
    try {
      res = await axios.get<AmnResponse>(`${indexerUrl}${IndexerRoutes.MASTER_NODE}/${address}`);
    } catch (e) {
      res = await axios.get<AmnResponse>(`${indexerUrl}${IndexerRoutes.MASTER_NODE2}/${address}`);
    }

    if (!res.data || !res.data.nodeMaster) {
      return { data: undefined };
    }

    const masterNode = res.data.nodeMaster;

    const powerRes = await executeCall({
      contractAddress,
      contractInterface,
      method: "getValidatorVoteWeight",
      args: [address, masterNode],
    });

    if (!powerRes.success) {
      return { data: { ...res.data, votingPower: BigInt(0) } };
    }

    return { data: { ...res.data, votingPower: powerRes.result.plain as bigint } };
  } catch (error) {
    console.error(`Failed to fetch votes results: ${error}`);
    return { data: undefined };
  }
};

export const getAllUsersNodes = async (address: string) => {
  const [allNodesRes, stargateNodesRes] = await executeMultipleClauses({
    contractAddress: nodeManagementAddress,
    contractInterface: nodeManagementInterface,
    methodsWithArgs: [
      { method: "getNodeIds", args: [address] },
      { method: "getUserStargateNFTsInfo", args: [address] },
    ],
  });

  if (!allNodesRes.success || !stargateNodesRes.success) return { nodes: [] };

  const AllNodes = (allNodesRes.result.plain as bigint[]).map(n => n.toString());
  const stargateNodes = (stargateNodesRes.result.plain as StargateNode[]).map(n => n.tokenId.toString());

  const nodes = AllNodes.map(nodeId => ({
    nodeId,
    isStargate: stargateNodes.includes(nodeId),
  }));

  return {
    nodes,
  };
};

export const isNodeDelegator = async (address: string) => {
  try {
    const res = await executeCall({
      contractAddress: nodeManagementAddress,
      contractInterface: nodeManagementInterface,
      method: "isNodeDelegator",
      args: [address],
    });

    return res.success ? (res.result.plain as boolean) : false;
  } catch (error) {
    console.error("Error checking if user is a node delegator:", error);
    return false;
  }
};
