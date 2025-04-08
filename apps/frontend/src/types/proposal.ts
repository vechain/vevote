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

export type CustomChoiceOptions =
  | {
      votingType: VotingEnum.SINGLE_OPTION;
      votingOptions: string[];
    }
  | {
      votingType: VotingEnum.MULTIPLE_OPTIONS;
      votingOptions: string[];
    };

export type VotingChoices = SingleChoiceOptions | CustomChoiceOptions;

export type ProposalStatus = "draft" | "upcoming" | "voting" | "approved" | "executed" | "canceled" | "rejected";

export type ProposalCardType = {
  id: string;
  proposer: string;
  createdAt: Date;
  headerImage: string;
  status: ProposalStatus;
  isVoted: boolean;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  question: string;
  maxSelection: number;
} & VotingChoices;
