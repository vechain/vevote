import { ProposalStatus } from "@/types/proposal";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useCastVote, useHasVoted, useVoteCastResults } from "./useCastVote";
import { VotingItemVariant } from "@/components/proposal/VotingItem";
import { getVotingVariant } from "@/utils/voting";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";
import { useNodes } from "./useUserQueries";
import { useDisclosure } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";

export const SHOW_RESULTS_STATUSES: ProposalStatus[] = [
  ProposalStatus.APPROVED,
  ProposalStatus.EXECUTED,
  ProposalStatus.VOTING,
  ProposalStatus.REJECTED,
  ProposalStatus.MIN_NOT_REACHED,
];

export const useVotingBase = (proposal: { id: string; status: ProposalStatus; startDate?: Date }) => {
  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();

  const enabled = useMemo(() => SHOW_RESULTS_STATUSES.includes(proposal.status), [proposal.status]);
  const { account } = useWallet();

  const { votes } = useVoteCastResults({
    proposalIds: [proposal.id],
    enabled,
  });

  const singleVote = useMemo(() => votes?.[0], [votes]);

  const { hasVoted } = useHasVoted({ proposalId: proposal.id });

  const [comment, setComment] = useState<string | undefined>(undefined);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const { masterNode } = useNodes();

  const commentDisabled = useMemo(() => {
    return votingVariant === "upcoming" || (votingVariant === "voting" && Boolean(singleVote?.reason)) || hasVoted;
  }, [votingVariant, singleVote?.reason, hasVoted]);

  const { sendTransaction: originalSendTransaction, isTransactionPending } = useCastVote({
    proposalId: proposal.id,
    masterNode,
  });

  const sendTransaction = useCallback(
    async (params: { id: string; selectedOption: 0 | 1 | 2; reason?: string }) => {
      try {
        trackEvent(MixPanelEvent.PROPOSAL_VOTE, {
          proposalId: params.id,
          vote: defaultSingleChoice[params.selectedOption],
          reason: params.reason,
        });

        const result = await originalSendTransaction(params);

        trackEvent(MixPanelEvent.PROPOSAL_VOTE_SUCCESS, {
          proposalId: params.id,
          vote: defaultSingleChoice[params.selectedOption],
          transactionId: result.txId,
          reason: params.reason,
        });

        return result;
      } catch (error) {
        const txError = error as { txId?: string; error?: { message?: string }; message?: string };
        const txId = txError.txId || "unknown";
        trackEvent(MixPanelEvent.PROPOSAL_VOTE_FAILED, {
          proposalId: params.id,
          vote: defaultSingleChoice[params.selectedOption],
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
    if (account?.address && singleVote?.reason) {
      setComment(singleVote.reason);
    } else if (!account?.address || !singleVote?.reason) {
      setComment(undefined);
    }
  }, [account?.address, singleVote?.reason]);

  return {
    votes: singleVote,
    votingVariant,
    sendTransaction,
    isTransactionPending,
    isSuccessOpen,
    onSuccessClose,
    onSuccessOpen,
    comment,
    setComment,
    commentDisabled,
  };
};
