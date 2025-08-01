import { Flex, Icon, Text, Box } from "@chakra-ui/react";
import { VoteIcon } from "@/icons";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { useMemo } from "react";
import { ResultsInfo } from "./components/ResultsInfo";
import { useIndexerVoteResults } from "@/hooks/useCastVote";
import { AllVotersModal } from "./components/AllVotersModal/AllVotersModal";
import { ProposalStatus, SingleChoiceEnum } from "@/types/proposal";
import { ColorByVote, IconByVote, voteOptions } from "@/constants";

export const ResultsSection = () => {
  const { proposal } = useProposal();
  const { results } = useIndexerVoteResults({ proposalId: proposal.id, size: voteOptions.length });

  const votePercentages = useMemo(() => {
    const abstainVotes = results?.data?.find(result => result.support === "ABSTAIN")?.totalWeight ?? 0;
    const forVotes = results?.data?.find(result => result.support === "FOR")?.totalWeight ?? 0;
    const againstVotes = results?.data?.find(result => result.support === "AGAINST")?.totalWeight ?? 0;

    const totalVotes = abstainVotes + forVotes + againstVotes;

    return {
      [SingleChoiceEnum.ABSTAIN]: totalVotes ? (abstainVotes / totalVotes) * 100 : 0,
      [SingleChoiceEnum.FOR]: totalVotes ? (forVotes / totalVotes) * 100 : 0,
      [SingleChoiceEnum.AGAINST]: totalVotes ? (againstVotes / totalVotes) * 100 : 0,
    };
  }, [results]);

  const isGreyIcon = [ProposalStatus.DRAFT, ProposalStatus.UPCOMING].includes(proposal.status);

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
          <Box flex={votePercentages[SingleChoiceEnum.FOR]} backgroundColor={ColorByVote.For} />
          <Box flex={votePercentages[SingleChoiceEnum.ABSTAIN]} backgroundColor={ColorByVote.Abstain} />
          <Box flex={votePercentages[SingleChoiceEnum.AGAINST]} backgroundColor={ColorByVote.Against} />
        </Flex>

        {/* Vote percentages */}
        <Flex gap={6} alignItems={"center"}>
          {voteOptions.map(option => (
            <Flex key={option} alignItems={"center"} gap={2}>
              <Icon
                as={IconByVote[option]}
                width={4}
                height={4}
                color={isGreyIcon ? "gray.500" : ColorByVote[option]}
              />
              <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.600"}>
                {votePercentages[option].toFixed(2)}%
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
      <ResultsInfo />
    </Flex>
  );
};
