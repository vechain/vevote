export type ProposalStatus = "draft" | "upcoming" | "voting" | "approved" | "executed" | "canceled" | "rejected";

export type ProposalCardType = {
  id: string;
  address: string;
  createdAt: Date;
  headerImage: string;
  status: ProposalStatus;
  isVoted: boolean;
  title: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
};

export enum CreateProposalStep {
  VOTING_DETAILS,
  VOTING_SETUP,
  VOTING_SUMMARY,
}

export enum VotingEnum {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  SINGLE_OPTION = "SINGLE_OPTION",
  MULTIPLE_OPTIONS = "MULTIPLE_OPTIONS",
}

export enum SingleChoiceEnum {
  YES = "Yes",
  NO = "No",
  ABSTAIN = "Abstain",
}

export type SingleChoiceOptions = {
  votingType: VotingEnum.SINGLE_CHOICE;
  votingOptions: SingleChoiceEnum[];
};

export type CustomChoiceOptions = {
  votingType: Extract<VotingEnum, VotingEnum.SINGLE_OPTION | VotingEnum.MULTIPLE_OPTIONS>;
  votingOptions: Record<string, string>[];
};

export type VotingChoices = SingleChoiceOptions | CustomChoiceOptions;
