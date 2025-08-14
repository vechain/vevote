import { Sort } from "@/components/ui/SortDropdown";
import { useVoteCastResults } from "@/hooks/useCastVote";
import { useVotersNodes } from "@/hooks/useUserQueries";
import { VoteItem } from "@/pages/Proposal/components/VotingAndTimeline/components/VotingCard/components/ResultsSection/components/AllVotersModal/components/VotersTable";
import { getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { useMemo } from "react";

export type VotersFilters = {
  selectedOption: string;
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

    return votedInfo.map(vote => {
      const totalVotingPowerPerVoter = nodes.reduce((acc, node) => {
        if (vote.stargateNFTs.includes(node.id)) {
          return acc + node.votingPower;
        }
        return acc;
      }, 0);

      return {
        date: vote.date,
        voter: vote.voter,
        votingPower: totalVotingPowerPerVoter,
        votedOption: getSingleChoiceFromIndex(vote.choice),
        transactionId: vote.transactionId,
      };
    });
  }, [nodes, votedInfo]);

  const filterOptions = useMemo(() => {
    const optionsSet = new Set<string>();
    votes.forEach(vote => {
      if (vote.votedOption) {
        optionsSet.add(vote.votedOption);
      }
    });
    return Array.from(optionsSet);
  }, [votes]);

  const filteredVotes = useMemo(() => {
    const { selectedOption, searchQuery, sort } = filters;
    const DEFAULT_FILTER = "All";

    const filtered = votes.reduce((acc: VoteItem[], vote) => {
      console.log("vote", vote.voter);
      const isSelectedOption =
        selectedOption && selectedOption !== DEFAULT_FILTER && vote.votedOption !== selectedOption;
      const isSearchQuery =
        searchQuery &&
        !(
          vote.voter.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vote.voter.domain && vote.voter.domain.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      if (isSelectedOption) return acc;
      if (isSearchQuery) return acc;
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
    totalVotes: votes.length,
    pagination: paginationData.pagination,
    filterOptions,
    isLoading: isVotesLoading || isNodesLoading,
    error: votesError || nodesError,
  };
};
