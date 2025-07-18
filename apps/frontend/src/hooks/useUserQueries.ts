import { getBlockFromDate } from "@/utils/proposals/helpers";
import { getAllUsersNodes, getNodesName, getAMN, getUserNodes, getUserRoles } from "@/utils/proposals/userQueries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import dayjs from "dayjs";

const getNodes = async ({ address, startDate }: { address: string; startDate: Date }) => {
  try {
    const today = dayjs();
    const blockDate = dayjs(startDate).isAfter(today) ? today.toDate() : startDate;
    const blockN = await getBlockFromDate(blockDate);
    if (!blockN) return { nodes: [] };

    const { data } = await getAMN(address);
    const masterNode = data?.nodeMaster;

    const r = await getUserNodes({ address, blockN: blockN?.number.toString() });
    return {
      nodes: r?.nodes || [],
      masterNode,
    };
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return { nodes: [] };
  }
};

export const useNodes = ({ startDate }: { startDate?: Date }) => {
  const { account } = useWallet();

  const { data, error, isLoading } = useQuery({
    queryKey: ["allNodes", startDate],
    queryFn: async () => await getNodes({ address: account?.address || "", startDate: startDate! }),
    enabled: Boolean(account?.address && startDate),
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
