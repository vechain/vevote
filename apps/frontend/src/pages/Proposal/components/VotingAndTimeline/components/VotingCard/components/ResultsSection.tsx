import { Flex, Icon, Text, Box } from "@chakra-ui/react";
import { VoteIcon, CircleInfoIcon } from "@/icons";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { useVotesResults } from "@/hooks/useCastVote";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { ThumbsUpIcon } from "@/icons/ThumbsUpIcon";
import { AbstainIcon } from "@/icons/AbstainIcon";
import { ThumbsDownIcon } from "@/icons/ThumbsDownIcon";

export const ResultsSection = () => {
  const voteOptions = ["Yes", "Abstain", "No"];
  const colors = ["green.500", "orange.300", "red.600"];
  const icons = [ThumbsUpIcon, AbstainIcon, ThumbsDownIcon];
  const { proposal } = useProposal();
  console.log("proposal", proposal);
  const { results } = useVotesResults({ proposalId: proposal.id, size: defaultSingleChoice.length });

  console.log("results", results);

  return (
    <Flex
      flexDirection={"column"}
      gap={6}
      padding={{ base: "16px", md: "24px" }}
      borderBottom={"1px solid"}
      borderColor={"gray.200"}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Flex alignItems={"center"} gap={3}>
          <Icon as={VoteIcon} width={5} height={5} color={"primary.700"} />
          <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
            Results
          </Text>
        </Flex>
      </Flex>

      <Flex flexDirection={"column"} gap={4}>
        {/* Progress bar */}
        <Flex height={"8px"} borderRadius={8} overflow={"hidden"} backgroundColor={"gray.200"}>
          <Box flex={1} backgroundColor={colors[0]} />
          <Box width={"27px"} backgroundColor={colors[1]} />
          <Box width={"35px"} backgroundColor={colors[2]} />
        </Flex>

        {/* Vote percentages */}
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          {voteOptions.map((option, index) => (
            <Flex key={option} alignItems={"center"} gap={2}>
              <Icon as={icons[index]} width={4} height={4} color={colors[index]} />
              <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.600"}>
                XX%
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      {/* Info alert */}
      <Flex gap={2} alignItems={"start"}>
        <Icon as={CircleInfoIcon} width={4} height={4} color={"blue.500"} marginTop={"2px"} />
        <Text fontSize={"12px"} color={"blue.700"}>
          A minimum of 30% participation must be reached to validate the voting of the proposal and get approval.
        </Text>
      </Flex>
    </Flex>
  );
};
