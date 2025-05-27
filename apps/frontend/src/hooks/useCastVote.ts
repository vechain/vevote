import { ProposalCardType } from "@/types/proposal";
import { fromStringToUint256 } from "@/utils/proposals/helpers";
import { getVotedChoices, getVotesResults } from "@/utils/proposals/votedQueris";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { EnhancedClause, useBuildTransaction, useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();
const hasVotedQueryKey = ["hasVoted"];

export const useHasVoted = ({ proposalId }: { proposalId: string }) => {
  const { votedChoices } = useVotedChoices({ proposalId, enabled: true });

  const hasVoted = useMemo(() => {
    if (!votedChoices || votedChoices.length === 0) return false;
    return votedChoices[0].choices.length > 0;
  }, [votedChoices]);
  return { hasVoted };
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
          data: contractInterface.encodeFunctionData("castVoteWithReason", [
            fromStringToUint256(id),
            numberChoices,
            "Cast vote with reason",
          ]),
          comment: `Cast vote with reason`,
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("castVoteWithReason"))),
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

export const useVotedChoices = ({ proposalId, enabled }: { proposalId?: string; enabled?: boolean }) => {
  const { account } = useWallet();

  const { data, isLoading, error } = useQuery({
    queryKey: ["votedChoices"],
    queryFn: async () => getVotedChoices(proposalId, account?.address),
    enabled,
  });
  return {
    votedChoices: data?.results?.data,
    isLoading,
    error,
  };
};

export const useVotesResults = ({
  proposalId,
  size,
  enabled,
}: {
  proposalId?: string;
  size?: number;
  enabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["votesResults"],
    queryFn: async () => getVotesResults(proposalId, size),
    enabled,
  });

  return {
    results: data?.results,
    isLoading,
    error,
  };
};
