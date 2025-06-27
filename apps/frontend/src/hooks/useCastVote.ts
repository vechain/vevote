import { ProposalCardType } from "@/types/proposal";
import { fromStringToUint256 } from "@/utils/proposals/helpers";
import { getHasVoted, getVotedChoices, getVotesResults } from "@/utils/proposals/votedQueries";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { ZERO_ADDRESS } from "@vechain/sdk-core";
import { EnhancedClause, useBuildTransaction, useThor, useWallet } from "@vechain/vechain-kit";
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
        const createProposalClause: EnhancedClause = {
          to: contractAddress,
          value: 0,
          data: contractInterface.encodeFunctionData("castVote", [
            fromStringToUint256(id),
            numberChoices,
            ZERO_ADDRESS,
          ]),
          comment: `Cast vote`,
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("castVote"))),
        };

        clauses.push(createProposalClause);

        return clauses;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [],
  );

  return useBuildTransaction({
    clauseBuilder: buildClauses,
    invalidateCache: true,
    refetchQueryKeys: [
      ["hasVoted", proposalId, account?.address],
      ["votesResults", proposalId],
      ["votedChoices", proposalId, account?.address],
    ],
  });
};

export const useVotedChoices = ({ proposalId, enabled }: { proposalId?: string; enabled?: boolean }) => {
  const { account } = useWallet();
  const thor = useThor();

  const { data, isLoading, error } = useQuery({
    queryKey: ["votedChoices", proposalId, account?.address],
    queryFn: async () => await getVotedChoices(thor, proposalId, account?.address),
    enabled,
  });

  return {
    votedChoices: data?.votedChoices,
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
