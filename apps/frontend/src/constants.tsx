import { SingleChoiceEnum } from "@/types/proposal";
import { AbstainIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/icons";

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
