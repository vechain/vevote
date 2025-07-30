import { Flex, Icon, Text, Box } from "@chakra-ui/react";
import { VoteIcon } from "@/icons";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { ThumbsUpIcon } from "@/icons/ThumbsUpIcon";
import { AbstainIcon } from "@/icons/AbstainIcon";
import { ThumbsDownIcon } from "@/icons/ThumbsDownIcon";
import { useMemo } from "react";
import { ResultsInfo } from "./components/ResultsInfo";
import { useIndexerVoteResults } from "@/hooks/useCastVote";
import { AllVotersModal } from "./components/AllVotersModal/AllVotersModal";

export const ResultsSection = () => {
  const voteOptions = ["for", "abstain", "against"];
  const colors = ["green.500", "orange.300", "red.600"];
  const icons = [ThumbsUpIcon, AbstainIcon, ThumbsDownIcon];
  const { proposal } = useProposal();
  const { results } = useIndexerVoteResults({ proposalId: proposal.id, size: defaultSingleChoice.length });

  const votePercentages = useMemo(() => {
    const abstainVotes = results?.data?.find(result => result.support === "ABSTAIN")?.totalWeight ?? 0;
    const forVotes = results?.data?.find(result => result.support === "FOR")?.totalWeight ?? 0;
    const againstVotes = results?.data?.find(result => result.support === "AGAINST")?.totalWeight ?? 0;

    const totalVotes = abstainVotes + forVotes + againstVotes;

    return {
      abstain: totalVotes ? (abstainVotes / totalVotes) * 100 : 0,
      for: totalVotes ? (forVotes / totalVotes) * 100 : 0,
      against: totalVotes ? (againstVotes / totalVotes) * 100 : 0,
    };
  }, [results]);

  return (
    <Flex flexDirection={"column"} gap={6} padding={{ base: "16px", md: "24px" }}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Flex alignItems={"center"} gap={3}>
          <Icon as={VoteIcon} width={5} height={5} color={"primary.700"} />
          <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
            Results
          </Text>
        </Flex>
        <AllVotersModal />
      </Flex>

      <Flex flexDirection={"column"} gap={4}>
        {/* Progress bar */}
        <Flex height={"8px"} borderRadius={8} overflow={"hidden"} backgroundColor={"gray.200"}>
          <Box flex={votePercentages.for} backgroundColor={colors[0]} />
          <Box flex={votePercentages.abstain} backgroundColor={colors[1]} />
          <Box flex={votePercentages.against} backgroundColor={colors[2]} />
        </Flex>

        {/* Vote percentages */}
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          {voteOptions.map((option, index) => (
            <Flex key={option} alignItems={"center"} gap={2}>
              <Icon as={icons[index]} width={4} height={4} color={colors[index]} />
              <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.600"}>
                {votePercentages[option as keyof typeof votePercentages].toFixed(2)}%
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
      <ResultsInfo />
    </Flex>
  );
};
