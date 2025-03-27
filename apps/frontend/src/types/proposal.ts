export type ProposalStatus = "draft" | "upcoming" | "voting" | "approved" | "executed" | "canceled" | "rejected";

export type ProposalCardType = {
  status: ProposalStatus;
  isVoted: boolean;
  title: string;
  startDate?: Date;
  endDate?: Date;
};
