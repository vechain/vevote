import { getQuorumThreshold } from "@/utils/proposals/quorumQueries";
import { useQuery } from "@tanstack/react-query";

export const useQuorum = (timePoint?: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getQuorumThreshold", timePoint],
    queryFn: async () => await getQuorumThreshold(timePoint || 0),
    enabled: Boolean(timePoint),
  });

  return {
    quorumPercentage: Math.ceil(data ? data / 100 : 0),
    isLoading,
    error,
  };
};
