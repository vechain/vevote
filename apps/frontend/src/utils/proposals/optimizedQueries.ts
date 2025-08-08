import { ProposalStatus, ProposalCardType } from "@/types/proposal";
import { applyFilters, enrichProposalsWithData, paginateProposals } from "@/utils/proposals/proposalQueriesUtils";
import { getProposalsEvents } from "@/utils/proposals/proposalsQueries";
import { ThorClient } from "@vechain/vechain-kit";

export const SESSION_KEY = Math.random().toString(36);

interface PaginationOptions {
  pageSize?: number;
  statuses?: ProposalStatus[];
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
  try {
    const data = await getProposalsEvents(thor, proposalId);
    const allProposals = data?.proposals || [];

    const enrichedProposals = await enrichProposalsWithData(allProposals);

    const filteredProposals = applyFilters(enrichedProposals, statuses, searchQuery);

    const { paginatedProposals, hasNextPage, nextCursor } = paginateProposals(filteredProposals, cursor, pageSize);

    return {
      proposals: paginatedProposals,
      nextCursor,
      hasNextPage,
      totalCount: filteredProposals.length,
    };
  } catch (error) {
    throw new Error(`Failed to fetch proposal: ${error}`);
  }
};

export type { PaginatedProposalsResult, PaginationOptions };
