import { getProposals, PaginatedProposalsResult, PaginationOptions } from "@/utils/proposals/optimizedQueries";
import { thorClient } from "@/utils/thorClient";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useProposalsEvents = (options: PaginationOptions = {}) => {
  const thor = thorClient;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useInfiniteQuery({
    queryKey: ["infiniteProposals", options],
    queryFn: async ({ pageParam }): Promise<PaginatedProposalsResult> =>
      await getProposals(thor, { ...options, cursor: pageParam as string }),
    getNextPageParam: (lastPage: PaginatedProposalsResult) => lastPage.nextCursor,
    enabled: !!thor,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    initialPageParam: undefined,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const allProposals = data?.pages.flatMap(page => page.proposals) || [];

  return {
    proposals: allProposals,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    fetchNextPage,
    error,
    totalCount: data?.pages[0]?.totalCount || 0,
  };
};
