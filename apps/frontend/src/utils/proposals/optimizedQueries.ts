import { FilterStatuses, ProposalCardType } from "@/types/proposal";
import { applyFilters, enrichProposalsWithData, paginateProposals } from "@/utils/proposals/proposalQueriesUtils";
import { getProposalsEvents } from "@/utils/proposals/proposalsQueries";
import { ThorClient } from "@vechain/vechain-kit";

export const SESSION_KEY = Math.random().toString(36);

interface PaginationOptions {
  pageSize?: number;
  statuses?: FilterStatuses[];
  searchQuery?: string;
}

interface PaginatedProposalsResult {
  proposals: ProposalCardType[];
  nextCursor?: string;
  hasNextPage: boolean;
  totalCount: number;
}

export const getProposals = async (
  thor: ThorClient,
  options: PaginationOptions & { cursor?: string } = {},
  proposalId?: string,
): Promise<PaginatedProposalsResult> => {
  const { pageSize = 20, statuses, searchQuery, cursor } = options;

  const data = await getProposalsEvents(thor, proposalId);
  const allProposals = data?.proposals || [];

  const { paginatedProposals, hasNextPage, nextCursor } = paginateProposals(allProposals, cursor, pageSize);
  const enrichedProposals = await enrichProposalsWithData(thor, paginatedProposals);
  const finalProposals = applyFilters(enrichedProposals, statuses, searchQuery);

  return {
    proposals: finalProposals,
    nextCursor,
    hasNextPage,
    totalCount: allProposals.length,
  };
};

export type { PaginatedProposalsResult, PaginationOptions };
