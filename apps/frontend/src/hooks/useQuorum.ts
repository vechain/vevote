import { getQuorumPercentage } from "@/utils/proposals/quorumQueries";
import { useQuery } from "@tanstack/react-query";

export const useQuorum = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["quorum"],
    queryFn: async () => await getQuorumPercentage(),
  });

  return {
    quorumPercentage: data,
    isLoading,
    error,
  };
};
