import { useQuery } from "@tanstack/react-query";
import { veVoteService } from "../services";

export function useVeVoteInfo() {
  return useQuery({
    queryKey: ["veVoteInfo"],
    queryFn: async () => await veVoteService.getVeVoteInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
}
