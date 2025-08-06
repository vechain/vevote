import { Flex, useDisclosure } from "@chakra-ui/react";
import { CountdownSection } from "./components/CountdownSection";
import { ResultsSection } from "./components/ResultsSection/ResultsSection";
import { VoteSection } from "./components/VoteSection";
import { SubmitVoteModal } from "./components/SubmitVoteModal";

export const VotingCard = () => {
  const submitVoteModal = useDisclosure();
  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}>
      <CountdownSection />
      <ResultsSection />
      <VoteSection submitVoteModal={submitVoteModal} />
      <SubmitVoteModal submitVoteModal={submitVoteModal} />
    </Flex>
  );
};
