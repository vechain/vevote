import { ProposalCardType } from "@/types/proposal";
import { calculateRefetchInterval } from "@/utils/proposals/helpers";
import { getProposals } from "@/utils/proposals/optimizedQueries";
import { thorClient } from "@/utils/thorClient";
import { useQuery } from "@tanstack/react-query";

export const useProposalEvent = (proposalId?: string) => {
  const thor = thorClient;

  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["proposalEvent", proposalId],
    queryFn: async (): Promise<ProposalCardType | null> => {
      try {
        if (!proposalId) return null;
        const result = await getProposals(thor, { pageSize: 1000 }, proposalId);
        const proposal = result.proposals.find(p => p.id === proposalId);

        if (!proposal) {
          throw new Error(`Proposal with ID ${proposalId} not found`);
        }

        return proposal;
      } catch (error) {
        throw new Error(`Failed to fetch proposal event: ${error}`);
      }
    },
    enabled: !!thor && !!proposalId,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: query => {
      const proposal = query.state.data ? [query.state.data] : [];
      return calculateRefetchInterval(proposal);
    },
  });

  return {
    proposal,
    loading: isLoading,
    error,
  };
};
