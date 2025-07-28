import { useVotesResults } from "@/hooks/useCastVote";
import { useI18nContext } from "@/i18n/i18n-react";
import { AbstainIcon, DisLikeIcon, LikeIcon } from "@/icons";
import { Flex, FlexProps, Icon, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

export const ProposalCardVotesResults = ({ proposalId }: { proposalId: string }) => {
  const { results } = useVotesResults({ proposalId });

  const proposalVotes = useMemo(() => {
    return (
      results?.data.reduce(
        (acc, vote) => {
          if (vote.support === "FOR") {
            acc.for += vote.totalWeight;
          } else if (vote.support === "AGAINST") {
            acc.against += vote.totalWeight;
          } else if (vote.support === "ABSTAIN") {
            acc.abstain += vote.totalWeight;
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
  }, [results?.data]);

  const isMostVOted = useCallback(
    (voteCount: number) => {
      const highestVoteCount = Math.max(proposalVotes.for, proposalVotes.against, proposalVotes.abstain);
      return voteCount === highestVoteCount;
    },
    [proposalVotes.abstain, proposalVotes.against, proposalVotes.for],
  );

  return (
    <Flex alignItems={"center"} gap={4}>
      <VoteBadge isMostVoted={isMostVOted(proposalVotes.for)} icon={LikeIcon} votes={proposalVotes.for} />
      <VoteBadge isMostVoted={isMostVOted(proposalVotes.abstain)} icon={AbstainIcon} votes={proposalVotes.abstain} />
      <VoteBadge isMostVoted={isMostVOted(proposalVotes.against)} icon={DisLikeIcon} votes={proposalVotes.against} />
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
