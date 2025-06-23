import { ProposalStatus } from "@/types/proposal";
import { useMemo } from "react";
import { useCastVote, useVotedChoices } from "./useCastVote";
import { VotingItemVariant } from "@/components/proposal/VotingItem";
import { getVotingVariant } from "@/utils/voting";

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

  const { sendTransaction, isTransactionPending } = useCastVote({
    proposalId: proposal.id,
  });

  return {
    votedChoices,
    votingVariant,
    sendTransaction,
    isTransactionPending,
  };
};
