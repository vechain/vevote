import { ExtendedStargateNode, GroupedExtendedStargateNode, NodeStrengthLevel } from "@/types/user";
import {
  getAllUsersNodes,
  getAMN,
  getNodesNameAndPower,
  getUserNodes,
  getUserRoles,
  isNodeDelegator,
} from "@/utils/proposals/userQueries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";

const getValidatorNode = (votingPower: bigint): ExtendedStargateNode => {
  return {
    votingPower,
    nodeName: votingPower > BigInt(0) ? NodeStrengthLevel.Validator : NodeStrengthLevel.InactiveValidator,
    levelId: 0,
    mintedAtBlock: BigInt(0),
    tokenId: BigInt(0),
    vetAmountStaked: BigInt(0),
    lastVthoClaimTimestamp: 0,
    multiplier: BigInt(100),
  };
};

const getNodes = async ({ address }: { address: string }) => {
  try {
    const { data } = await getAMN(address);
    const masterNode = data?.nodeMaster;
    const masterNodeVotingPower = data?.votingPower || BigInt(0);

    const r = await getUserNodes({ address });
    const nodes = masterNode ? [getValidatorNode(masterNodeVotingPower), ...(r?.nodes || [])] : r?.nodes || [];

    // group nodes by levelId and add a property count, return the array of nodes with the count property
    const groupedNodes = nodes.reduce((acc, node) => {
      const existingNode = acc.find((n: GroupedExtendedStargateNode) => n.levelId === node.levelId);
      if (existingNode) {
        existingNode.count = (existingNode.count || 0) + 1;
        existingNode.votingPower = existingNode.votingPower + node.votingPower;
      } else {
        acc.push({ ...node, count: 1 });
      }
      return acc;
    }, [] as GroupedExtendedStargateNode[]);

    return {
      groupedNodes,
      nodes,
      masterNode,
    };
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return { nodes: [] };
  }
};

export const useNodes = () => {
  const { account } = useWallet();

  const { data, error, isLoading } = useQuery({
    queryKey: ["allNodes", account?.address],
    queryFn: async () => await getNodes({ address: account?.address || "" }),
    enabled: Boolean(account?.address),
  });

  return {
    groupedNodes: data?.groupedNodes || [],
    nodes: data?.nodes || [],
    masterNode: data?.masterNode,
    isLoading,
    isError: Boolean(error),
  };
};

export const useUserRoles = () => {
  const { account } = useWallet();

  const { data, error } = useQuery({
    queryKey: ["userRoles", account?.address],
    queryFn: async () => await getUserRoles({ address: account?.address || "" }),
    enabled: Boolean(account?.address),
  });

  return {
    roles: data,
    isLoading: !error && !data,
    isError: Boolean(error),
  };
};

export const useVotersNodes = ({ nodeIds }: { nodeIds: string[] }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["votersNodes", nodeIds],
    queryFn: async () => await getNodesNameAndPower({ nodeIds }),
  });

  return {
    nodes: data || [],
    isLoading,
    isError: Boolean(error),
  };
};

export const useAllUserNodes = () => {
  const { account } = useWallet();

  const { data, error, isLoading } = useQuery({
    queryKey: ["allUserNodes", account?.address],
    queryFn: async () => await getAllUsersNodes(account?.address || ""),
    enabled: Boolean(account?.address),
  });

  return {
    allNodes: data?.nodes || [],
    isLoading,
    isError: Boolean(error),
  };
};

export const useIsDelegator = () => {
  const { account } = useWallet();

  const { data, error, isLoading } = useQuery({
    queryKey: ["isNodeDelegator", account?.address],
    queryFn: async () => await isNodeDelegator(account?.address || ""),
    enabled: Boolean(account?.address),
  });

  return {
    isDelegator: data || false,
    isLoading,
    isError: Boolean(error),
  };
};
