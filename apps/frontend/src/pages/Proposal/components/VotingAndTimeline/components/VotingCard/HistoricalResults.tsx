import { InfoBox } from "@/components/ui/InfoBox";
import { useI18nContext } from "@/i18n/i18n-react";
import { VoteIcon } from "@/icons";
import { HistoricalProposalMerged } from "@/types/historicalProposals";
import { ProposalStatus } from "@/types/proposal";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";

export const HistoricalResults = ({ proposal }: { proposal: HistoricalProposalMerged }) => {
  const { LL } = useI18nContext();

  const choices = useMemo(() => {
    return proposal.choicesWithVote?.sort((a, b) => b.votes - a.votes);
  }, [proposal]);

  const minNotReached = useMemo(() => proposal.status === ProposalStatus.MIN_NOT_REACHED, [proposal.status]);

  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}
      maxW={"380px"}>
      <Flex alignItems={"center"} gap={3} padding={6} borderBottom={"1px solid"} borderColor={"gray.200"}>
        <Icon as={VoteIcon} width={5} height={5} color={"primary.700"} />
        <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
          {LL.results()}
        </Text>
      </Flex>
      <Flex
        flexDirection={"column"}
        gap={3}
        padding={6}
        maxHeight={choices && choices.length > 4 ? "320px" : "auto"}
        overflowY={choices && choices.length > 4 ? "auto" : "visible"}>
        <>
          {choices?.map(choice => (
            <Flex key={choice.choice} flexDirection={"column"} gap={1}>
              <Flex justifyContent={"space-between"} alignItems={"flex-start"}>
                <Text fontSize={"14px"} fontWeight={500} color={"gray.700"} flex={1} noOfLines={2} mr={2}>
                  {choice.choice}
                </Text>
                <Text fontSize={"14px"} fontWeight={500} color={"gray.700"} flexShrink={0}>
                  {choice.votes} {LL.votes()}
                </Text>
              </Flex>
              <Flex height={"8px"} width={"100%"} backgroundColor={"gray.100"} borderRadius={4} overflow={"hidden"}>
                <Flex
                  height={"100%"}
                  width={`${choice.percentage}%`}
                  backgroundColor={"primary.500"}
                  borderRadius={4}
                />
              </Flex>
              {!minNotReached && (
                <Text fontSize={"12px"} color={"gray.500"} fontWeight={500}>
                  {choice.percentage.toFixed(2)}%
                </Text>
              )}
            </Flex>
          ))}
        </>
      </Flex>
      {minNotReached && (
        <Box padding={4}>
          <InfoBox variant="min-not-reached">
            <Flex direction={"column"} gap={1}>
              <Text fontSize={"14px"} fontWeight={500} color={"red.700"}>
                {LL.proposal.minimum_quorum_not_reached()}
              </Text>
            </Flex>
          </InfoBox>
        </Box>
      )}
    </Flex>
  );
};
