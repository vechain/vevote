import { ProposalStatus } from "@/types/proposal";
import { useMemo, useCallback } from "react";
import { useCastVote, useVotedChoices } from "./useCastVote";
import { VotingItemVariant } from "@/components/proposal/VotingItem";
import { getVotingVariant } from "@/utils/voting";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";

export const SHOW_RESULTS_STATUSES: ProposalStatus[] = [
  "approved",
  "executed",
  "voting",
  "rejected",
  "min-not-reached",
];

export const useVotingBase = (proposal: { id: string; status: ProposalStatus }) => {
  const enabled = useMemo(() => SHOW_RESULTS_STATUSES.includes(proposal.status), [proposal.status]);

  const { votedChoices } = useVotedChoices({
    proposalId: proposal.id,
    enabled,
  });

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const {
    sendTransaction: originalSendTransaction,
    isTransactionPending,
    txReceipt,
  } = useCastVote({
    proposalId: proposal.id,
  });

  const sendTransaction = useCallback(
    async (params: { id: string; selectedOptions: (1 | 0)[] }) => {
      const voteOption = params.selectedOptions
        .map((opt, index) => (opt === 1 ? index : null))
        .filter(i => i !== null)
        .join(",");

      try {
        trackEvent(MixPanelEvent.PROPOSAL_VOTE, {
          proposalId: params.id,
          vote: voteOption,
        });

        await originalSendTransaction(params);

        trackEvent(MixPanelEvent.PROPOSAL_VOTE_SUCCESS, {
          proposalId: params.id,
          vote: voteOption,
          transactionId: txReceipt?.meta.txID || "unknown",
        });
      } catch (error) {
        trackEvent(MixPanelEvent.PROPOSAL_VOTE_FAILED, {
          proposalId: params.id,
          vote: voteOption,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    [originalSendTransaction, txReceipt?.meta.txID],
  );

  return {
    votedChoices,
    votingVariant,
    sendTransaction,
    isTransactionPending,
  };
};
