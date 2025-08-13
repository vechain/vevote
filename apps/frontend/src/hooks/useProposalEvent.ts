import { ProposalCardType } from "@/types/proposal";
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
      if (!proposalId) return null;
      const result = await getProposals(thor, { pageSize: 1000 }, proposalId);
      return result.proposals.find(p => p.id === proposalId) || null;
    },
    enabled: !!thor && !!proposalId,
    // staleTime: 30 * 1000,
    // gcTime: 10 * 60 * 1000,
  });

  return {
    proposal,
    loading: isLoading,
    error,
  };
};
