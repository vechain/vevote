import { getProposals, PaginatedProposalsResult, PaginationOptions } from "@/utils/proposals/optimizedQueries";
import { thorClient } from "@/utils/thorClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProposalCardType, ProposalStatus } from "@/types/proposal";
import { areAddressesEqual } from "@/utils/address";
import { useMemo } from "react";
import { useWallet } from "@vechain/vechain-kit";
import { calculateRefetchInterval } from "@/utils/proposals/helpers";

interface UseProposalsEventsOptions extends PaginationOptions {
  draftProposal?: ProposalCardType | null;
}

export const useProposalsEvents = (options: UseProposalsEventsOptions = {}) => {
  const { account } = useWallet();
  const { draftProposal, ...queryOptions } = options;
  const thor = thorClient;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useInfiniteQuery({
    queryKey: ["infiniteProposals", queryOptions],
    queryFn: async ({ pageParam }): Promise<PaginatedProposalsResult> => {
      return await getProposals(thor, { ...queryOptions, cursor: pageParam as string });
    },
    getNextPageParam: (lastPage: PaginatedProposalsResult) => lastPage.nextCursor,
    enabled: !!thor,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    initialPageParam: undefined,
    refetchInterval: query => {
      const proposals = query.state.data?.pages.flatMap(page => page.proposals) || [];
      return calculateRefetchInterval(proposals);
    },
  });

  const fetchedProposals = useMemo(() => data?.pages.flatMap(page => page.proposals) || [], [data?.pages]);

  const allProposals = useMemo(() => {
    const isDraftProposal = draftProposal && areAddressesEqual(draftProposal?.proposer, account?.address);
    const isDraftFilterActive = queryOptions.statuses?.includes(ProposalStatus.DRAFT);

    return isDraftProposal && isDraftFilterActive ? [draftProposal, ...fetchedProposals] : fetchedProposals;
  }, [account?.address, draftProposal, fetchedProposals, queryOptions.statuses]);

  const totalCount = useMemo(() => {
    const baseCount = data?.pages[0]?.totalCount || 0;
    const isDraftProposal = draftProposal && areAddressesEqual(draftProposal?.proposer, account?.address);
    return isDraftProposal ? baseCount + 1 : baseCount;
  }, [data?.pages, draftProposal, account?.address]);

  return {
    proposals: allProposals,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    fetchNextPage,
    error,
    totalCount,
  };
};
