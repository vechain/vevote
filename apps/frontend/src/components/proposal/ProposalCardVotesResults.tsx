import { useI18nContext } from "@/i18n/i18n-react";
import { AbstainIcon, DisLikeIcon, LikeIcon } from "@/icons";
import { Flex, FlexProps, Icon, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

export const ProposalCardVotesResults = () => {
  const votes = useMemo(
    () => ({
      forVotes: 100, // Replace with actual data
      againstVotes: 50, // Replace with actual data
      abstainVotes: 25, // Replace with actual data
    }),
    [],
  );

  const isMostVOted = useCallback(
    (voteCount: number) => {
      const highestVoteCount = Math.max(votes.forVotes, votes.againstVotes, votes.abstainVotes);
      return voteCount === highestVoteCount;
    },
    [votes],
  );

  return (
    <Flex alignItems={"center"} gap={4}>
      <VoteBadge isMostVoted={isMostVOted(votes.forVotes)} icon={LikeIcon} votes={votes.forVotes} />
      <VoteBadge isMostVoted={isMostVOted(votes.againstVotes)} icon={DisLikeIcon} votes={votes.againstVotes} />
      <VoteBadge isMostVoted={isMostVOted(votes.abstainVotes)} icon={AbstainIcon} votes={votes.abstainVotes} />
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
