import { useMemo } from "react";
import { VotedResult } from "@/types/votes";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { SingleChoiceEnum } from "@/types/proposal";

const getSupportByIndex = (choiceIndex: number) => {
  const choice = defaultSingleChoice[choiceIndex];
  switch (choice) {
    case SingleChoiceEnum.FOR:
      return "FOR";
    case SingleChoiceEnum.AGAINST:
      return "AGAINST";
    case SingleChoiceEnum.ABSTAIN:
      return "ABSTAIN";
  }
};

export const useVotesSectionCalculations = ({
  results,
  choiceIndex,
}: {
  results?: VotedResult;
  choiceIndex: number;
}) => {
  const choiceWeight = useMemo(() => {
    if (!results) return 0;
    const matchingResult = results.data.find(r => r.support === getSupportByIndex(choiceIndex));
    return matchingResult?.totalWeight ?? 0;
  }, [choiceIndex, results]);

  const totalWeight = useMemo(() => {
    if (!results) return 0;
    return results.data.reduce((sum, result) => sum + (result.totalWeight ?? 0), 0);
  }, [results]);

  const voterCount = useMemo(() => {
    if (!results) return 0;
    const matchingResult = results.data.find(r => r.support === getSupportByIndex(choiceIndex));
    return matchingResult?.totalVoters ?? 0;
  }, [choiceIndex, results]);

  const votesPercentage = useMemo(() => {
    if (totalWeight === 0) return 0;
    return (choiceWeight / totalWeight) * 100;
  }, [choiceWeight, totalWeight]);

  return {
    choiceWeight,
    totalWeight,
    voterCount,
    votesPercentage,
  };
};
