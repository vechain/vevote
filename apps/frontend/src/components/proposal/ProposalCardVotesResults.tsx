import { useI18nContext } from "@/i18n/i18n-react";
import { AbstainIcon, DisLikeIcon, LikeIcon } from "@/icons";
import { VotesCastResult } from "@/types/votes";
import { Flex, FlexProps, Icon, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

export const ProposalCardVotesResults = ({ results }: { proposalId: string; results: VotesCastResult[] }) => {
  const totalPerVotes = useMemo(() => {
    return results.reduce((sum, result) => sum + (Number(result.weight) ?? 0), 0);
  }, [results]);

  const proposalVotes = useMemo(() => {
    return (
      results?.reduce(
        (acc, vote) => {
          const weight = Number(vote.weight);
          if (vote.choice === 1) {
            acc.for += weight;
          } else if (vote.choice === 0) {
            acc.against += weight;
          } else if (vote.choice === 2) {
            acc.abstain += weight;
          }
          return acc;
        },
        {
          for: 0,
          against: 0,
          abstain: 0,
        },
      ) || { for: 0, against: 0, abstain: 0 }
    );
  }, [results]);

  const proposalVotesPercentage = useMemo(() => {
    return {
      for: Number(((proposalVotes.for / totalPerVotes) * 100 || 0).toFixed()),
      against: Number(((proposalVotes.against / totalPerVotes) * 100 || 0).toFixed()),
      abstain: Number(((proposalVotes.abstain / totalPerVotes) * 100 || 0).toFixed()),
    };
  }, [proposalVotes, totalPerVotes]);

  const isMostVOted = useCallback(
    (voteCount: number) => {
      if (voteCount === 0) return false;
      const highestVoteCount = Math.max(proposalVotes.for, proposalVotes.against, proposalVotes.abstain);
      return voteCount === highestVoteCount;
    },
    [proposalVotes.abstain, proposalVotes.against, proposalVotes.for],
  );

  return (
    <Flex alignItems={"center"} gap={4}>
      <VoteBadge isMostVoted={isMostVOted(proposalVotes.for)} icon={LikeIcon} votes={proposalVotesPercentage.for} />
      <VoteBadge
        isMostVoted={isMostVOted(proposalVotes.abstain)}
        icon={AbstainIcon}
        votes={proposalVotesPercentage.abstain}
      />
      <VoteBadge
        isMostVoted={isMostVOted(proposalVotes.against)}
        icon={DisLikeIcon}
        votes={proposalVotesPercentage.against}
      />
    </Flex>
  );
};

const VoteBadge = ({
  isMostVoted,
  icon,
  votes,
  ...restProps
}: FlexProps & {
  isMostVoted?: boolean;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  votes: number;
}) => {
  const { LL } = useI18nContext();
  return (
    <Flex
      padding={2}
      alignItems={"center"}
      gap={2}
      borderRadius={"6px"}
      bg={isMostVoted ? "gray.100" : "transparent"}
      color={isMostVoted ? "primary.500" : "gray.600"}
      fontWeight={isMostVoted ? "bold" : "normal"}
      {...restProps}>
      <Icon as={icon} boxSize={{ base: 4, md: 6 }} />
      <Text fontSize={{ base: "14px", md: "16px" }}>{`${votes}${LL.percentage()}`}</Text>
    </Flex>
  );
};
