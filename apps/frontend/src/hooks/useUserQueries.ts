import { AmnResponse } from "@/types/user";
import { getBlockFromDate } from "@/utils/proposals/helpers";
import { getAMN, getUserNodes, getUserRoles } from "@/utils/proposals/userQueries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";

const getNodes = async ({ address, startDate }: { address: string; startDate: Date }) => {
  try {
    let amn: AmnResponse | undefined = undefined;
    if (address) {
      const { data } = await getAMN(address);
      if (data) amn = data;
    }
    const blockN = await getBlockFromDate(startDate);
    if (!blockN) return { nodes: [] };
    const r = await getUserNodes({ address, blockN: blockN?.number.toString() });
    return {
      nodes: r?.nodes || [],
      isEndorser: amn?.endorser || false,
      nodeMaster: amn?.nodeMaster || "",
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
    isEndorser: data?.isEndorser || false,
    nodeMaster: data?.nodeMaster || "",
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
