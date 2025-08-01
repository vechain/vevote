import { SingleChoiceEnum } from "@/types/proposal";
import { AbstainIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/icons";

// this is used to order votes, because SingleChoiceEnum has "against" as first option but we want to display "for" first
export const voteOptions = [SingleChoiceEnum.FOR, SingleChoiceEnum.AGAINST, SingleChoiceEnum.ABSTAIN];

export const ColorByVote = {
  [SingleChoiceEnum.AGAINST]: "red.600",
  [SingleChoiceEnum.FOR]: "green.600",
  [SingleChoiceEnum.ABSTAIN]: "orange.400",
};
export const IconByVote = {
  [SingleChoiceEnum.AGAINST]: ThumbsDownIcon,
  [SingleChoiceEnum.FOR]: ThumbsUpIcon,
  [SingleChoiceEnum.ABSTAIN]: AbstainIcon,
};
