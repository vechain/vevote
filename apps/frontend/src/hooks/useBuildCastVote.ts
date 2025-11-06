import { ProposalCardType } from "@/types/proposal";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { fromStringToUint256 } from "@/utils/proposals/helpers";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@vechain/vevote-contracts";
import { ABIFunction, Address, Clause, ZERO_ADDRESS } from "@vechain/sdk-core";
import { EnhancedClause, useWallet } from "@vechain/vechain-kit";
import { useCallback } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useBuildCastVote = ({ proposalId, masterNode }: { proposalId?: string; masterNode?: string }) => {
  const { account } = useWallet();
  const buildClauses = useCallback(
    ({ id, selectedOption, reason }: Pick<ProposalCardType, "id"> & { selectedOption: 0 | 1 | 2; reason?: string }) => {
      const clauses: EnhancedClause[] = [];

      try {
        const functionName = reason?.trim() ? "castVoteWithReason" : "castVote";
        const encodedData = reason?.trim()
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
      ["voteCastResults", proposalId, account?.address],
      ["totalVotes", proposalId],
    ],
  });
};
