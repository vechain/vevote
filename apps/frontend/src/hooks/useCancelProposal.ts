import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause, useBuildTransaction } from "@vechain/vechain-kit";
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

  const { sendTransaction, txReceipt, ...rest } = useBuildTransaction({
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
          transactionId: txReceipt?.meta.txID || "unknown",
        });

        return result;
      } catch (error) {
        trackEvent(MixPanelEvent.PROPOSAL_CANCEL_FAILED, {
          proposalId: params.proposalId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    [sendTransaction, txReceipt?.meta.txID],
  );

  return {
    ...rest,
    txReceipt,
    sendTransaction: sendTransactionWithTracking,
  };
};
