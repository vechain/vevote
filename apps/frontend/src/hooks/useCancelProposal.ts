import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { useCallback } from "react";

type ClausesProps = {
  proposalId: string;
  reason?: string;
};

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useCancelProposal = () => {
  const buildClauses = useCallback(({ proposalId, reason }: ClausesProps) => {
    const clauses: EnhancedClause[] = [];

    try {
      const baseClause = {
        to: contractAddress,
        value: 0,
      };

      const cancelClause = reason
        ? {
            ...baseClause,
            data: contractInterface.encodeFunctionData("cancelWithReason", [proposalId, reason]),
            abi: JSON.parse(JSON.stringify(contractInterface.getFunction("cancelWithReason"))),
            comment: `Cancel proposal with reason: ${reason}`,
          }
        : {
            ...baseClause,
            data: contractInterface.encodeFunctionData("cancel", [proposalId]),
            abi: JSON.parse(JSON.stringify(contractInterface.getFunction("cancel"))),
            comment: `Cancel proposal`,
          };

      clauses.push(cancelClause as EnhancedClause);

      return clauses;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    delayedRefetchKeys: [["infiniteProposals"], ["proposalEvent"]],
    refetchDelay: 100,
  });
};
