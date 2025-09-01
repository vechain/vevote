import { ColorByVote, IconByVote } from "@/constants";
import { ProposalStatus, SingleChoiceEnum } from "@/types/proposal";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";

export const ProposalCardVotesResults = ({
  status,
  votePercentages,
}: {
  status: ProposalStatus;
  votePercentages: {
    [SingleChoiceEnum.FOR]: number;
    [SingleChoiceEnum.AGAINST]: number;
    [SingleChoiceEnum.ABSTAIN]: number;
  };
}) => {
  const quorumNotReached = useMemo(() => status === ProposalStatus.MIN_NOT_REACHED, [status]);

  const isMostVoted = useMemo(() => {
    const maxPercentage = Math.max(votePercentages.Against, votePercentages.For, votePercentages.Abstain);
    return {
      For: votePercentages.For === maxPercentage,
      Against: votePercentages.Against === maxPercentage,
      Abstain: votePercentages.Abstain === maxPercentage,
    };
  }, [votePercentages]);

  const votePercentageOrdered = useMemo(() => {
    return Object.keys(votePercentages);
  }, [votePercentages]);

  return (
    <Flex gap={3} alignItems={"center"}>
      {votePercentageOrdered.map(opt => {
        const option = opt as SingleChoiceEnum;
        const percentage = votePercentages[option];
        const mostVoted = quorumNotReached || percentage <= 0 ? false : isMostVoted[option];
        const color = ColorByVote[option];
        return (
          <Flex key={option} alignItems={"center"} gap={2}>
            <Icon as={IconByVote[option]} width={4} height={4} color={mostVoted ? color : "gray.500"} />
            <Text
              fontSize={{ base: "14px", md: "16px" }}
              color={mostVoted ? color : undefined}
              fontWeight={mostVoted ? "500" : "300"}>
              {percentage.toFixed(2)}%
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};
