import { ProposalCardType } from "@/types/proposal";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { fromStringToUint256, getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { getHasVoted, getVoteCastResults, getIndexerVoteResults } from "@/utils/proposals/votedQueries";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { ABIFunction, Address, Clause, ZERO_ADDRESS } from "@vechain/sdk-core";
import { EnhancedClause, useThor, useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useHasVoted = ({ proposalId }: { proposalId?: string }) => {
  const { account } = useWallet();
  const { data } = useQuery({
    queryKey: ["hasVoted", proposalId, account?.address],
    queryFn: async () => await getHasVoted(proposalId, account?.address),
    enabled: !!proposalId && !!account?.address,
  });

  return { hasVoted: data || false };
};

export const useCastVote = ({ proposalId, masterNode }: { proposalId?: string; masterNode?: string }) => {
  const { account } = useWallet();
  const buildClauses = useCallback(
    ({ id, selectedOption, reason }: Pick<ProposalCardType, "id"> & { selectedOption: 0 | 1 | 2; reason?: string }) => {
      const clauses: EnhancedClause[] = [];

      try {
        const functionName = reason && reason.trim() ? "castVoteWithReason" : "castVote";
        const encodedData =
          reason && reason.trim()
            ? [fromStringToUint256(id), selectedOption, reason, masterNode || ZERO_ADDRESS]
            : [fromStringToUint256(id), selectedOption, masterNode || ZERO_ADDRESS];

        const interfaceJson = contractInterface.getFunction(functionName)?.format("full");
        if (!interfaceJson) throw new Error(`Method ${functionName} not found`);

        const functionAbi = new ABIFunction(interfaceJson);

        const clause = Clause.callFunction(Address.of(contractAddress), functionAbi, encodedData);

        clauses.push(clause);

        return clauses;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [masterNode],
  );

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    refetchQueryKeys: [
      ["hasVoted", proposalId, account?.address],
      ["votedChoices", proposalId, account?.address],
    ],
    delayedRefetchKeys: [["votesResults", proposalId]],
  });
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
    queryKey: ["votedChoices", proposalIds, address],
    queryFn: async () => await getVoteCastResults(thor, { proposalIds, address }),
    enabled: enabled && !!thor,
  });

  return {
    votes: data?.votes,
    isLoading,
    error,
  };
};

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
