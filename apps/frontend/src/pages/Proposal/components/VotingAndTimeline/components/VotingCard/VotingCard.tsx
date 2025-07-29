import { Button, Flex } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { CountdownSection } from "./components/CountdownSection";
import { ResultsSection } from "./components/ResultsSection";
import { ProposalStatus } from "@/types/proposal";

export const VotingCard = () => {
  const { proposal } = useProposal();
  const isUpcoming = proposal.status === ProposalStatus.UPCOMING;
  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}
      minWidth={{ base: "auto", md: "480px" }}>
      {/* Countdown section */}
      <CountdownSection />
      {/* Results section */}
      <ResultsSection />

      {/* Vote button section */}
      <Flex flexDirection={"column"} gap={6} padding={{ base: "16px", md: "24px" }}>
        <Button
          width={"100%"}
          height={"56px"}
          backgroundColor={isUpcoming ? "primary.100" : "primary.500"}
          color={isUpcoming ? "primary.300" : "white"}
          fontWeight={600}
          fontSize={"16px"}
          borderRadius={8}
          isDisabled={isUpcoming}
          _hover={{
            backgroundColor: isUpcoming ? "primary.100" : "primary.600",
          }}>
          Submit your vote
        </Button>
      </Flex>
    </Flex>
  );
};
