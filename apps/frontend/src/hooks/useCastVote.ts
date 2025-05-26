import { ProposalCardType } from "@/types/proposal";
import { fromStringToUint256 } from "@/utils/proposals/helpers";
import { getHasVoted, getVotedChoices, getVotesResults } from "@/utils/proposals/votedQueris";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { EnhancedClause, useBuildTransaction, useConnex, useWallet } from "@vechain/vechain-kit";
import { useCallback } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();
const hasVotedQueryKey = ["hasVoted"];

export const useHasVoted = ({ proposalId }: { proposalId: string }) => {
  const { account } = useWallet();
  const { data } = useQuery({
    queryKey: hasVotedQueryKey,
    queryFn: async () => await getHasVoted(proposalId, account?.address),
    enabled: !!proposalId || !!account?.address,
  });

  return { hasVoted: data || false };
};

export const useCastVote = () => {
  const buildClauses = useCallback(
    ({ id, selectedOptions }: Pick<ProposalCardType, "id"> & { selectedOptions: (1 | 0)[] }) => {
      const clauses: EnhancedClause[] = [];

      const numberChoices = parseInt(selectedOptions.reverse().join(""), 2);

      try {
        const createProposalClause: EnhancedClause = {
          to: contractAddress,
          value: 0,
          data: contractInterface.encodeFunctionData("castVote", [fromStringToUint256(id), numberChoices]),
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
    refetchQueryKeys: [hasVotedQueryKey],
  });
};

export const useVotedChoices = ({ proposalId }: { proposalId?: string }) => {
  const { account } = useWallet();
  const accountAddress = account?.address;
  const { thor } = useConnex();

  const { data, isLoading, error } = useQuery({
    queryKey: ["votedChoices", proposalId, accountAddress],
    queryFn: async () => getVotedChoices(thor, proposalId, accountAddress),
    enabled: !!proposalId && !!accountAddress,
  });
  return {
    votedChoices: data?.votedChoices || undefined,
    isLoading,
    error,
  };
};

export const useVotesResults = ({ proposalId, size }: { proposalId?: string; size?: number }) => {
  const { account } = useWallet();
  const accountAddress = account?.address;

  const { data, isLoading, error } = useQuery({
    queryKey: ["votesResults"],
    queryFn: async () => getVotesResults(proposalId, size),
    enabled: !!proposalId && !!accountAddress,
  });

  return {
    results: data?.results || undefined,
    isLoading,
    error,
  };
};
