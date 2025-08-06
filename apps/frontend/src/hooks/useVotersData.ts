import { Sort } from "@/components/ui/SortDropdown";
import { useVoteCastResults } from "@/hooks/useCastVote";
import { useVotersNodes } from "@/hooks/useUserQueries";
import { VoteItem } from "@/pages/Proposal/components/VotingAndTimeline/components/VotingCard/components/ResultsSection/components/AllVotersModal/components/VotersTable";
import { NodeStrengthLevel } from "@/types/user";
import { getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { useMemo } from "react";

export type VotersFilters = {
  selectedOption: string;
  node: NodeStrengthLevel | string;
  searchQuery: string;
  sort: Sort;
};

export const useVotersData = ({
  proposalId,
  filters,
  page = 1,
  pageSize = 10,
}: {
  proposalId: string;
  filters: VotersFilters;
  page?: number;
  pageSize?: number;
}) => {
  const {
    votes: votedInfo,
    isLoading: isVotesLoading,
    error: votesError,
  } = useVoteCastResults({ proposalIds: [proposalId], enabled: proposalId !== "draft" });

  const {
    nodes,
    isLoading: isNodesLoading,
    isError: nodesError,
  } = useVotersNodes({
    nodeIds: votedInfo?.flatMap(vote => vote.stargateNFTs) || [],
  });

  const votes = useMemo(() => {
    if (!votedInfo) return [];

    return votedInfo
      .map(vote => {
        return vote.stargateNFTs.map(node => {
          const nodeInfo = nodes.find(n => n.id === node);
          return {
            date: vote.date,
            address: vote.voter.domain || vote.voter.address,
            node: nodeInfo?.name || "Unknown",
            nodeId: node,
            votingPower: nodeInfo?.votingPower || 0,
            votedOption: getSingleChoiceFromIndex(vote.choice),
            transactionId: vote.transactionId,
          };
        });
      })
      .flat();
  }, [votedInfo, nodes]);

  const filterOptions = useMemo(() => {
    const optionsSet = new Set<string>();
    votes.forEach(vote => {
      if (vote.votedOption) {
        optionsSet.add(vote.votedOption);
      }
    });
    return Array.from(optionsSet);
  }, [votes]);

  const nodeOptions = useMemo(() => {
    const usedNodes = new Set(votes.map(vote => vote.node).filter(Boolean));
    return Array.from(usedNodes) as NodeStrengthLevel[];
  }, [votes]);

  const filteredVotes = useMemo(() => {
    const { selectedOption, node, searchQuery, sort } = filters;
    const DEFAULT_FILTER = "All";

    const filtered = votes.reduce((acc: VoteItem[], vote) => {
      if (node && node !== DEFAULT_FILTER && vote.node !== node) return acc;
      if (selectedOption && selectedOption !== DEFAULT_FILTER && vote.votedOption !== selectedOption) return acc;
      if (searchQuery && !vote.address.toLowerCase().includes(searchQuery.toLowerCase())) return acc;

      acc.push(vote);
      return acc;
    }, []);

    if (sort === Sort.Oldest) {
      return [...filtered].reverse();
    }

    return filtered;
  }, [votes, filters]);

  const paginationData = useMemo(() => {
    const totalItems = filteredVotes.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVotes = filteredVotes.slice(startIndex, endIndex);

    return {
      votes: paginatedVotes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }, [filteredVotes, page, pageSize]);

  return {
    votes: paginationData.votes,
    pagination: paginationData.pagination,
    allVotes: filteredVotes, // Keep all filtered votes for backward compatibility
    filterOptions,
    nodeOptions,
    isLoading: isVotesLoading || isNodesLoading,
    error: votesError || nodesError,
  };
};
