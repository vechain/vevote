import { getProposalClock } from "@/utils/proposals/proposalsQueries";
import { useQuery } from "@tanstack/react-query";

export const useProposalClock = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["proposalClock"],
    queryFn: async () => await getProposalClock(),
  });

  if (error) {
    console.error("Error fetching proposal clock:", error);
  }

  return {
    minVotingDelay: data?.minVotingDelay || 0,
    maxVotingDuration: data?.maxVotingDuration || 0,
    isLoading,
  };
};
