import { ProposalStatus } from "@/types/proposal";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useCastVote, useVotedChoices } from "./useCastVote";
import { VotingItemVariant } from "@/components/proposal/VotingItem";
import { getVotingVariant } from "@/utils/voting";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";
import { useWallet } from "@vechain/vechain-kit";

export const SHOW_RESULTS_STATUSES: ProposalStatus[] = [
  "approved",
  "executed",
  "voting",
  "rejected",
  "min-not-reached",
];

export const useVotingBase = (proposal: { id: string; status: ProposalStatus }) => {
  const enabled = useMemo(() => SHOW_RESULTS_STATUSES.includes(proposal.status), [proposal.status]);
  const { account } = useWallet();

  const { votedChoices } = useVotedChoices({
    proposalId: proposal.id,
    enabled,
  });

  const [comment, setComment] = useState<string | undefined>(undefined);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const commentDisabled = useMemo(() => {
    return votingVariant === "upcoming" || (votingVariant === "voting" && Boolean(votedChoices?.reason));
  }, [votingVariant, votedChoices?.reason]);

  const { sendTransaction: originalSendTransaction, isTransactionPending } = useCastVote({
    proposalId: proposal.id,
  });

  const sendTransaction = useCallback(
    async (params: { id: string; selectedOptions: (1 | 0)[]; reason?: string }) => {
      const voteOption = params.selectedOptions
        .map((opt, index) => (opt === 1 ? index : null))
        .filter(i => i !== null)
        .join(",");

      try {
        trackEvent(MixPanelEvent.PROPOSAL_VOTE, {
          proposalId: params.id,
          vote: voteOption,
          reason: params.reason,
        });

        const result = await originalSendTransaction(params);

        trackEvent(MixPanelEvent.PROPOSAL_VOTE_SUCCESS, {
          proposalId: params.id,
          vote: voteOption,
          transactionId: result.txId,
          reason: params.reason,
        });

        return result;
      } catch (error) {
        const txError = error as { txId?: string; error?: { message?: string }; message?: string };
        const txId = txError.txId || "unknown";
        trackEvent(MixPanelEvent.PROPOSAL_VOTE_FAILED, {
          proposalId: params.id,
          vote: voteOption,
          error: txError.error?.message || txError.message || "Unknown error",
          transactionId: txId,
          reason: params.reason,
        });
        throw error;
      }
    },
    [originalSendTransaction],
  );

  useEffect(() => {
    //TODO: This is a temporary fix to reset the comment when the wallet changes or disconnects.
    // Reset comment when wallet changes or disconnects
    setComment(undefined);
  }, [account?.address]);

  useEffect(() => {
    // Only set comment if wallet is connected
    if (account?.address) {
      if (votedChoices?.reason) {
        setComment(votedChoices.reason);
      } else if (votedChoices && !votedChoices.reason) {
        setComment(undefined);
      }
    }
  }, [votedChoices]);

  return {
    votedChoices,
    votingVariant,
    sendTransaction,
    isTransactionPending,
    comment,
    setComment,
    commentDisabled,
  };
};
