import { useQuery } from "@tanstack/react-query";
import { veVoteService } from "../services";

export const useContractAddresses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["contractAddresses"],
    queryFn: async () => await veVoteService.getContractAddress(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    contractAddresses: data,
    isLoading,
    error,
  };
};
