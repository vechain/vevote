import { ProposalCardType } from "@/types/proposal";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { fromStringToUint256 } from "@/utils/proposals/helpers";
import { getHasVoted, getVotedChoices, getVotesResults } from "@/utils/proposals/votedQueries";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { ABIFunction, Address, Clause, ZERO_ADDRESS } from "@vechain/sdk-core";
import { EnhancedClause, useThor, useWallet } from "@vechain/vechain-kit";
import { useCallback } from "react";

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

export const useVotedChoices = ({ proposalId, enabled }: { proposalId?: string; enabled?: boolean }) => {
  const { account } = useWallet();
  const thor = useThor();

  const { data, isLoading, error } = useQuery({
    queryKey: ["votedChoices", proposalId, account?.address],
    queryFn: async () => await getVotedChoices(thor, proposalId, account?.address),
    enabled: enabled && !!thor && !!proposalId && !!account?.address,
  });

  return {
    votedChoices: data?.votedChoices?.[0],
    isLoading,
    error,
  };
};

export const useVotesResults = ({ proposalId, size }: { proposalId?: string; size?: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["votesResults", proposalId],
    queryFn: async () => await getVotesResults(proposalId, size),
    refetchInterval: 10000,
  });

  return {
    results: data?.results,
    isLoading,
    error,
  };
};

export const useVotesInfo = ({ proposalId }: { proposalId: string }) => {
  const thor = useThor();

  const { data, isLoading, error } = useQuery({
    queryKey: ["votedChoices", proposalId],
    queryFn: async () => await getVotedChoices(thor, proposalId),
    enabled: !!thor && !!proposalId,
  });

  return {
    votedInfo: data?.votedChoices,
    isLoading,
    error,
  };
};
