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

export const useCastVote = ({ proposalId }: { proposalId?: string }) => {
  const { account } = useWallet();
  const buildClauses = useCallback(
    ({ id, selectedOptions }: Pick<ProposalCardType, "id"> & { selectedOptions: (1 | 0)[] }) => {
      const clauses: EnhancedClause[] = [];

      const numberChoices = parseInt(selectedOptions.reverse().join(""), 2);

      try {
        const encodedData = [fromStringToUint256(id), numberChoices, ZERO_ADDRESS];

        const interfaceJson = contractInterface.getFunction("castVote")?.format("full");
        if (!interfaceJson) throw new Error(`Method propose not found`);

        const functionAbi = new ABIFunction(interfaceJson);

        const clause = Clause.callFunction(Address.of(contractAddress), functionAbi, encodedData) as EnhancedClause;

        clauses.push(clause);

        return clauses;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [],
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
