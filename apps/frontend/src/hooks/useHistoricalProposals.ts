import { parseHistoricalProposals } from "@/utils/proposals/helpers";
import { getHistoricalProposal } from "@/utils/proposals/historicalProposal";
import { useQuery } from "@tanstack/react-query";

export const useHistoricalProposals = (proposalId?: string) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["historicalProposals"],
    queryFn: async () => await getHistoricalProposal(proposalId),
    staleTime: 1000 * 60 * 5,
  });

  return { historicalProposals: parseHistoricalProposals(data?.results), error, isLoading };
};
