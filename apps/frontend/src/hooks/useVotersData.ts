import { useCallback, useMemo } from "react";
import { BaseOption, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { NodeStrengthLevel } from "@/types/user";
import { VoteItem } from "@/components/proposal/VotersTable";
import { useVotesInfo } from "@/hooks/useCastVote";
import { useVotersNodes } from "@/hooks/useUserQueries";
import { Sort } from "@/components/ui/SortDropdown";

export type VotersFilters = {
  selectedOption: string;
  node: NodeStrengthLevel | string;
  searchQuery: string;
  sort: Sort;
};

export const useVotersData = ({
  proposalId,
  votingType,
  votingOptions,
  filters,
  page = 1,
  pageSize = 10,
}: {
  proposalId: string;
  votingType: VotingEnum;
  votingOptions: SingleChoiceEnum[] | BaseOption[];
  filters: VotersFilters;
  page?: number;
  pageSize?: number;
}) => {
  const { votedInfo, isLoading: isVotesLoading, error: votesError } = useVotesInfo({ proposalId });

  const {
    nodes,
    isLoading: isNodesLoading,
    isError: nodesError,
  } = useVotersNodes({
    nodeIds: votedInfo?.flatMap(vote => vote.stargateNFTs) || [],
  });

  const nodeMap = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach(node => {
      map.set(node.id, node.name);
    });
    return map;
  }, [nodes]);

  const getVotingChoicesFromBinary = useCallback(
    (choices: string[]) => {
      return choices
        .map((choice, index) => {
          if (Number(choice) === 1) {
            if (votingType === VotingEnum.MULTIPLE_OPTIONS) {
              return (votingOptions as BaseOption[])[index]?.value;
            }
            return (votingOptions as SingleChoiceEnum[])[index];
          }
          return undefined;
        })
        .filter(Boolean) as (SingleChoiceEnum | BaseOption["value"])[];
    },
    [votingOptions, votingType],
  );

  const votes = useMemo(() => {
    if (!votedInfo) return [];

    return votedInfo.reduce((acc: VoteItem[], vote) => {
      const votingChoices = getVotingChoicesFromBinary(vote.choices) || [];
      const nodeNames = vote.stargateNFTs.map(id => nodeMap.get(id) || id);
      const votingPower = Number(vote.weight) / 100;

      if (votingChoices.length === 0) {
        acc.push({
          date: vote.date,
          address: vote.voter,
          node: nodeNames[0] || "",
          nodeId: vote.stargateNFTs[0] || "",
          votingPower,
          votedOption: "",
          transactionId: vote.transactionId,
        });
        return acc;
      }

      return votingChoices.reduce((choiceAcc, choice, choiceIndex) => {
        const nodeIndex = choiceIndex < nodeNames.length ? choiceIndex : 0;
        choiceAcc.push({
          date: vote.date,
          address: vote.voter,
          node: nodeNames[nodeIndex] || "",
          nodeId: vote.stargateNFTs[nodeIndex] || "",
          votingPower,
          votedOption: choice,
          transactionId: vote.transactionId,
        });
        return choiceAcc;
      }, acc);
    }, []);
  }, [votedInfo, nodeMap, getVotingChoicesFromBinary]);

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
    return Array.from(usedNodes);
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
