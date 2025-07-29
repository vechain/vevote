import { VotingItemVariant } from "@/components/proposal/VotingItem";
import { ProposalStatus } from "@/types/proposal";

export const getVotingVariant = (proposalStatus: string): VotingItemVariant => {
  switch (proposalStatus) {
    case ProposalStatus.UPCOMING:
      return "upcoming";
    case ProposalStatus.VOTING:
      return "voting";
    case ProposalStatus.APPROVED:
    case ProposalStatus.EXECUTED:
      return "result-win";
    default:
      return "result-lost";
  }
};
