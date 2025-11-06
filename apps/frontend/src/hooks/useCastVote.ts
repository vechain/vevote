import { SingleChoiceEnum } from "@/types/proposal";
import { getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { getHasVoted, getIndexerVoteResults, getTotalVotes, getVoteCastResults } from "@/utils/proposals/votedQueries";
import { useQuery } from "@tanstack/react-query";
import { useThor, useWallet } from "@vechain/vechain-kit";
import { useMemo } from "react";

export const useHasVoted = ({ proposalId }: { proposalId?: string }) => {
  const { account } = useWallet();
  const { data } = useQuery({
    queryKey: ["hasVoted", proposalId, account?.address],
    queryFn: async () => await getHasVoted(proposalId, account?.address),
    enabled: !!proposalId && !!account?.address,
  });

  return { hasVoted: data || false };
};

export const useVoteCastResults = ({
  proposalIds,
  address,
  enabled,
}: {
  proposalIds?: string[];
  address?: string;
  enabled?: boolean;
}) => {
  const thor = useThor();

  const { data, isLoading, error } = useQuery({
    queryKey: ["voteCastResults", proposalIds, address],
    queryFn: async () => await getVoteCastResults(thor, { proposalIds, address }),
    enabled: enabled && !!thor,
  });

  return {
    votes: data?.votes,
    isLoading,
    error,
  };
};

export const useTotalVotes = ({ proposalId }: { proposalId: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["totalVotes", proposalId],
    queryFn: async () => await getTotalVotes(proposalId),
  });

  return {
    totalVotes: Number(data) / 100,
    isLoading,
    error,
  };
};

export const useVoteByProposalId = ({ proposalId, enabled }: { proposalId: string; enabled?: boolean }) => {
  const { account } = useWallet();
  const { votes, isLoading, error } = useVoteCastResults({
    proposalIds: [proposalId],
    address: account?.address,
    enabled,
  });

  const voteData = useMemo(() => votes?.find(v => v.proposalId === proposalId), [votes, proposalId]);

  return {
    voteData,
    vote: getSingleChoiceFromIndex(voteData?.choice || 0),
    isLoading,
    error,
  };
};

export const useVoteCastPercentages = ({ proposalId }: { proposalId?: string }) => {
  const thor = useThor();

  const { votes, isLoading, error } = useVoteCastResults({
    proposalIds: proposalId ? [proposalId] : [],
    enabled: !!thor && !!proposalId,
  });

  const votePercentages = useMemo(() => {
    if (!votes) {
      return {
        [SingleChoiceEnum.FOR]: 0,
        [SingleChoiceEnum.AGAINST]: 0,
        [SingleChoiceEnum.ABSTAIN]: 0,
      };
    }

    const voteTotals = votes.reduce(
      (acc, vote) => {
        const weight = parseFloat(vote.weight);
        switch (vote.choice) {
          case 1:
            acc.for += weight;
            break;
          case 0:
            acc.against += weight;
            break;
          case 2:
            acc.abstain += weight;
            break;
        }
        return acc;
      },
      { for: 0, against: 0, abstain: 0 },
    );

    const totalVotes = voteTotals.against + voteTotals.for + voteTotals.abstain;

    return {
      [SingleChoiceEnum.FOR]: totalVotes ? (voteTotals.for / totalVotes) * 100 : 0,

      [SingleChoiceEnum.AGAINST]: totalVotes ? (voteTotals.against / totalVotes) * 100 : 0,
      [SingleChoiceEnum.ABSTAIN]: totalVotes ? (voteTotals.abstain / totalVotes) * 100 : 0,
    };
  }, [votes]);

  return {
    votePercentages,
    votes,
    isLoading,
    error,
  };
};

//NOT USED YET
export const useIndexerVoteResults = ({ proposalId, size }: { proposalId?: string; size?: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["votesResults", proposalId],
    queryFn: async () => await getIndexerVoteResults(proposalId, size),
    refetchInterval: 10000,
  });

  return {
    results: data?.results,
    isLoading,
    error,
  };
};
