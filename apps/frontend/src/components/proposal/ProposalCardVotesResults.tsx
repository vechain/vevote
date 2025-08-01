import { SingleChoiceEnum } from "@/types/proposal";
import { VotesCastResult } from "@/types/votes";
import { getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { IconByVote, ColorByVote } from "@/constants";

export const ProposalCardVotesResults = ({ results }: { proposalId: string; results: VotesCastResult[] }) => {
  const totalPerVotes = useMemo(() => {
    return results.reduce((sum, result) => sum + (Number(result.weight) ?? 0), 0);
  }, [results]);

  const proposalVotes = useMemo(() => {
    return (
      results?.reduce(
        (acc, vote) => {
          const weight = Number(vote.weight);
          const choice = getSingleChoiceFromIndex(vote.choice);
          switch (choice) {
            case SingleChoiceEnum.FOR:
              acc[SingleChoiceEnum.FOR] += weight;
              break;
            case SingleChoiceEnum.AGAINST:
              acc[SingleChoiceEnum.AGAINST] += weight;
              break;
            case SingleChoiceEnum.ABSTAIN:
              acc[SingleChoiceEnum.ABSTAIN] += weight;
              break;
          }
          return acc;
        },
        {
          [SingleChoiceEnum.FOR]: 0,
          [SingleChoiceEnum.AGAINST]: 0,
          [SingleChoiceEnum.ABSTAIN]: 0,
        },
      ) || { [SingleChoiceEnum.FOR]: 0, [SingleChoiceEnum.AGAINST]: 0, [SingleChoiceEnum.ABSTAIN]: 0 }
    );
  }, [results]);

  const proposalVotesPercentage = useMemo(() => {
    return {
      [SingleChoiceEnum.FOR]: Number(((proposalVotes[SingleChoiceEnum.FOR] / totalPerVotes) * 100 || 0).toFixed()),
      [SingleChoiceEnum.AGAINST]: Number(
        ((proposalVotes[SingleChoiceEnum.AGAINST] / totalPerVotes) * 100 || 0).toFixed(),
      ),
      [SingleChoiceEnum.ABSTAIN]: Number(
        ((proposalVotes[SingleChoiceEnum.ABSTAIN] / totalPerVotes) * 100 || 0).toFixed(),
      ),
    };
  }, [proposalVotes, totalPerVotes]);

  const isMostVoted = useCallback(
    (voteCount: number) => {
      if (voteCount === 0) return false;
      const highestVoteCount = Math.max(
        proposalVotes[SingleChoiceEnum.FOR],
        proposalVotes[SingleChoiceEnum.AGAINST],
        proposalVotes[SingleChoiceEnum.ABSTAIN],
      );
      return voteCount === highestVoteCount;
    },
    [proposalVotes],
  );

  return (
    <Flex gap={{ base: 3, md: 6 }} alignItems={"center"}>
      {Object.keys(proposalVotesPercentage).map(option => {
        const mostVoted = isMostVoted(proposalVotes[option as keyof typeof proposalVotes]);
        const percentage = proposalVotesPercentage[option as keyof typeof proposalVotesPercentage];
        const color = ColorByVote[option as keyof typeof ColorByVote];
        return (
          <Flex
            key={option}
            alignItems={"center"}
            gap={2}
            padding={2}
            borderRadius={"xl"}
            border={mostVoted ? "2px solid" : "none"}
            borderColor={mostVoted ? color : undefined}>
            <Icon
              as={IconByVote[option as keyof typeof IconByVote]}
              width={4}
              height={4}
              color={mostVoted ? color : "gray.500"}
            />
            <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.600"}>
              {percentage.toFixed(2)}%
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};
