import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { useCallback } from "react";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

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

      let createProposalClause = {};

      if (reason) {
        createProposalClause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("cancelWithReason", [proposalId, reason]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("cancelWithReason"))),
          comment: `Cancel proposal with reason: ${reason}`,
        };
      } else {
        createProposalClause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("cancel", [proposalId]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("cancel"))),
          comment: `Cancel proposal`,
        };
      }

      clauses.push(createProposalClause as EnhancedClause);

      return clauses;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const { sendTransaction, ...rest } = useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    invalidateCache: true,
    refetchQueryKeys: [["proposalsEvents"]],
  });

  const sendTransactionWithTracking = useCallback(
    async (params: ClausesProps) => {
      try {
        trackEvent(MixPanelEvent.PROPOSAL_CANCEL, {
          proposalId: params.proposalId,
        });

        const result = await sendTransaction(params);

        trackEvent(MixPanelEvent.PROPOSAL_CANCEL_SUCCESS, {
          proposalId: params.proposalId,
          transactionId: result.txId,
        });

        return result;
      } catch (error) {
        const txError = error as { txId?: string; error?: { message?: string }; message?: string };
        
        trackEvent(MixPanelEvent.PROPOSAL_CANCEL_FAILED, {
          proposalId: params.proposalId,
          error: txError.error?.message || txError.message || "Unknown error",
          transactionId: txError.txId || "unknown",
        });
        throw error;
      }
    },
    [sendTransaction],
  );

  return {
    ...rest,
    sendTransaction: sendTransactionWithTracking,
  };
};
