import { ProposalStatus } from "@/types/proposal";
import { applyFilters, enrichProposalsWithData, paginateProposals } from "@/utils/proposals/proposalQueriesUtils";
import { getProposalsEvents } from "@/utils/proposals/proposalsQueries";
import { ThorClient } from "@vechain/vechain-kit";
import { getHistoricalProposal } from "@/utils/proposals/historicalProposal";
import { parseHistoricalProposals } from "@/utils/proposals/helpers";
import { MergedProposal } from "@/types/historicalProposals";

export const SESSION_KEY = Math.random().toString(36);

interface PaginationOptions {
  pageSize?: number;
  statuses?: ProposalStatus[];
  searchQuery?: string;
}

interface PaginatedProposalsResult {
  proposals: MergedProposal[];
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
    const [blockchainData, historicalData] = await Promise.all([
      getProposalsEvents(thor, proposalId),
      getHistoricalProposal(proposalId),
    ]);

    const blockchainProposals = blockchainData?.proposals || [];
    const historicalProposals = parseHistoricalProposals(historicalData?.results);

    const enrichedBlockchainProposals = await enrichProposalsWithData(blockchainProposals);

    const blockchainIds = new Set(enrichedBlockchainProposals.map(p => p.id));

    const uniqueHistoricalProposals = historicalProposals.filter(hp => !blockchainIds.has(hp.id));

    const allProposals: MergedProposal[] = [...enrichedBlockchainProposals, ...uniqueHistoricalProposals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const filteredProposals = applyFilters(allProposals, statuses, searchQuery);

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
