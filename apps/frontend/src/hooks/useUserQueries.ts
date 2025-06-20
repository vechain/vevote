import { getBlockFromDate } from "@/utils/proposals/helpers";
import { getUserNodes, getUserRoles } from "@/utils/proposals/userQueries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";

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

export const useNodes = ({ startDate }: { startDate?: Date }) => {
  const { account } = useWallet();

  const { data: blockNumber } = useQuery({
    queryKey: ["blockNumber", { date: startDate }],
    queryFn: async () => await getBlockFromDate(startDate),
    enabled: Boolean(startDate),
  });

  const { data, error } = useQuery({
    queryKey: ["allNodes", { address: account?.address, blockN: blockNumber }],
    queryFn: async () => await getUserNodes({ address: account?.address || "", blockN: blockNumber?.toString() }),
    enabled: Boolean(account?.address) && Boolean(blockNumber),
  });

  return {
    nodes: data?.nodes || [],
    isLoading: !error && !data,
    isError: Boolean(error),
  };
};
