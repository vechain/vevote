import { VotingItemVariant } from "@/components/proposal/VotingItem";

export const getVotingVariant = (proposalStatus: string): VotingItemVariant => {
  switch (proposalStatus) {
    case "upcoming":
      return "upcoming";
    case "voting":
      return "voting";
    case "approved":
    case "executed":
      return "result-win";
    default:
      return "result-lost";
  }
};
