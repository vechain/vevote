import { ProposalStatus, SingleChoiceEnum } from "@/types/proposal";
import { VotesCastResult } from "@/types/votes";
import { getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { Flex, Icon } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { IconByVote, ColorByVote } from "@/constants";

export const ProposalCardVotesResults = ({
  status,
  results,
}: {
  status: ProposalStatus;
  results: VotesCastResult[];
}) => {
  const totalPerVotes = useMemo(() => {
    return results.reduce((sum, result) => sum + (Number(result.weight) ?? 0), 0);
  }, [results]);

  const quorumNotReached = status === ProposalStatus.MIN_NOT_REACHED;

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
    <Flex gap={3} alignItems={"center"}>
      {Object.keys(proposalVotesPercentage).map(option => {
        const mostVoted = quorumNotReached ? false : isMostVoted(proposalVotes[option as keyof typeof proposalVotes]);
        const color = ColorByVote[option as keyof typeof ColorByVote];
        return (
          <Flex key={option} alignItems={"center"} padding={2}>
            <Icon
              as={IconByVote[option as keyof typeof IconByVote]}
              width={4}
              height={4}
              color={mostVoted ? color : "gray.300"}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};
