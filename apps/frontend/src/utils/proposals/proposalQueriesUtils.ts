import { IpfsDetails } from "@/types/ipfs";
import { getProposalsFromIpfs } from "../ipfs/proposal";
import { filterStatus, FromEventsToProposalsReturnType, mergeIpfsDetails } from "./helpers";
import { getVoteCastResults } from "./votedQueries";
import { getProposalsWithState } from "./proposalsQueries";
import { ThorClient } from "@vechain/vechain-kit";
import { FilterStatuses, ProposalCardType } from "@/types/proposal";

export const paginateProposals = (proposals: ProposalCardType[], cursor?: string, pageSize = 20) => {
  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = startIndex + pageSize;
  const paginatedProposals = proposals.slice(startIndex, endIndex);
  const hasNextPage = endIndex < proposals.length;
  const nextCursor = hasNextPage ? endIndex.toString() : undefined;

  return { paginatedProposals, hasNextPage, nextCursor };
};

export const enrichProposalsWithData = async (thor: ThorClient, proposals: FromEventsToProposalsReturnType) => {
  const { votes } = await getVoteCastResults(thor, {
    proposalIds: proposals.map(p => p.id),
  });

  const ipfsFetches = proposals.map(p => getProposalsFromIpfs(p.ipfsHash));
  const ipfsDetails: IpfsDetails[] = await Promise.all(ipfsFetches);

  const mergedWithIpfs = mergeIpfsDetails(ipfsDetails, proposals);
  const merged = mergedWithIpfs?.map(p => ({
    ...p,
    results: votes?.filter(v => v.proposalId === p.id),
  }));

  return await getProposalsWithState(merged);
};

export const applyFilters = (proposals: ProposalCardType[], statuses?: FilterStatuses[], searchQuery?: string) => {
  let filtered = proposals;

  if (statuses && statuses.length > 0) {
    filtered = filtered.filter(p => filterStatus(statuses, p.status));
  }

  if (searchQuery && searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.title?.toLowerCase().includes(searchLower));
  }

  return filtered;
};
