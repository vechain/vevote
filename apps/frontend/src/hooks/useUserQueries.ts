import {
  getAllUsersNodes,
  getAMN,
  getNodesName,
  getUserNodes,
  getUserRoles,
  isNodeDelegator,
} from "@/utils/proposals/userQueries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";

const getNodes = async ({ address }: { address: string }) => {
  try {
    const { data } = await getAMN(address);
    const masterNode = data?.nodeMaster;

    const r = await getUserNodes({ address });
    return {
      nodes: r?.nodes || [],
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
    queryFn: async () => await getNodesName({ nodeIds }),
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
