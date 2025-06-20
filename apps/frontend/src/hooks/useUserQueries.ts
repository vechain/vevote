import { getBlockFromDate } from "@/utils/proposals/helpers";
import { getUserNodes, getUserRoles } from "@/utils/proposals/userQueries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { useEffect, useState } from "react";

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

export const useUserNodes = () => {
  const { account } = useWallet();

  const { data, error } = useQuery({
    queryKey: ["userNodes", account?.address],
    queryFn: async () => await getUserNodes({ address: account?.address || "" }),
    enabled: Boolean(account?.address),
  });

  return {
    nodes: data?.nodes || [],
    isLoading: !error && !data,
    isError: Boolean(error),
  };
};

export const useNodes = ({ startDate }: { startDate?: Date }) => {
  const { account } = useWallet();
  const [blockN, setBlockN] = useState<string | undefined>(undefined);

  const { data, error } = useQuery({
    queryKey: ["allNodes", { address: account?.address, blockN }],
    queryFn: async () => await getUserNodes({ address: account?.address || "", blockN }),
    enabled: Boolean(account?.address) && Boolean(blockN),
  });

  useEffect(() => {
    const getBlock = async (date: Date) => {
      const blockNumber = await getBlockFromDate(date);
      setBlockN(String(blockNumber));
    };
    if (startDate) {
      getBlock(startDate);
    }
  }, [startDate]);

  return {
    nodes: data?.nodes || [],
    isLoading: !error && !data,
    isError: Boolean(error),
  };
};
