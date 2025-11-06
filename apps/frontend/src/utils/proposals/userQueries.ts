import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../contract";
import { VeVote__factory } from "@vechain/vevote-contracts";
import { StargateNFT__factory } from "@vechain/vevote-contracts/typechain-types";
import { ExtendedStargateNode, NodeStrengthLevels, StargateNode } from "@/types/user";
import axios from "axios";
import { IndexerRoutes } from "@/types/indexer";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const stargateNFTAddress = getConfig(import.meta.env.VITE_APP_ENV).stargateNFTContractAddress;
const indexerUrl = getConfig(import.meta.env.VITE_APP_ENV).indexerUrl;

const contractInterface = VeVote__factory.createInterface();
const stargateNftInterface = StargateNFT__factory.createInterface();
// no Stargate address in FE config; use NFT address directly

async function getStargateNftAddress() {
  if (!stargateNFTAddress) throw new Error("Missing stargateNFTContractAddress in config");
  return stargateNFTAddress as `0x${string}`;
}

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
    const nftAddress = await getStargateNftAddress();
    const tokensRes = await executeCall({
      contractAddress: nftAddress,
      contractInterface: stargateNftInterface,
      method: "tokensManagedBy",
      args: [address],
    });

    if (!tokensRes.success) return { nodes: [] };

    const owned = tokensRes.result.plain as { tokenId: bigint; levelId: number }[];
    const userNodes: StargateNode[] = owned.map(t => ({ tokenId: t.tokenId, levelId: t.levelId }) as StargateNode);

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
  const nodeLevelArgs = nodeIds.map(node => ({ method: "getTokenLevel" as const, args: [node] }));

  const [nodesPower, nodesLevel] = await Promise.all([
    executeMultipleClauses({
      contractAddress,
      contractInterface,
      methodsWithArgs: votingPowerArgs,
    }),
    (async () => {
      const nftAddress = await getStargateNftAddress();
      return executeMultipleClauses({
        contractAddress: nftAddress,
        contractInterface: stargateNftInterface,
        methodsWithArgs: nodeLevelArgs,
      });
    })(),
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
    const url = `${indexerUrl}${IndexerRoutes.MASTER_NODE}${address}&page=0&size=1&direction=DESC`;
    const res = await axios.get(url, { headers: { accept: "*/*" } });

    const data = res.data;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.content)
          ? data.content
          : [];

    if (!Array.isArray(list) || list.length === 0) return { data: undefined };

    const first = list[0];
    const masterNode = first?.address ?? first?.id ?? (typeof first === "string" ? first : undefined);
    if (!masterNode) return { data: undefined };

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
  const nftAddress = await getStargateNftAddress();
  const idsRes = await executeCall({
    contractAddress: nftAddress,
    contractInterface: stargateNftInterface,
    method: "idsManagedBy",
    args: [address],
  });

  if (!idsRes.success) return { nodes: [] };

  const nodeIds = (idsRes.result.plain as bigint[]).map(n => n.toString());
  const nodes = nodeIds.map(nodeId => ({ nodeId, isStargate: true }));

  return {
    nodes,
  };
};

export const isNodeDelegator = async (address: string) => {
  try {
    const nftAddress = await getStargateNftAddress();
    const res = await executeCall({
      contractAddress: nftAddress,
      contractInterface: stargateNftInterface,
      method: "idsOwnedBy",
      args: [address],
    });
    if (!res.success) return false;
    const ids = res.result.plain as bigint[];
    if (ids.length > 0) return true;
    const managedRes = await executeCall({
      contractAddress: nftAddress,
      contractInterface: stargateNftInterface,
      method: "tokensManagedBy",
      args: [address],
    });
    if (!managedRes.success) return false;
    const managed = managedRes.result.plain as unknown[];
    return managed.length > 0;
  } catch (error) {
    console.error("Error checking if user is a node delegator:", error);
    return false;
  }
};
