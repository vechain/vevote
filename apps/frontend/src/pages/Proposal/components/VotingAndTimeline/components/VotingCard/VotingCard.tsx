import { Flex } from "@chakra-ui/react";
import { CountdownSection } from "./components/CountdownSection";
import { ResultsSection } from "./components/ResultsSection/ResultsSection";
import { VoteSection } from "./components/VoteSection";

export const VotingCard = () => {
  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}
      minWidth={{ base: "auto", md: "480px" }}>
      <CountdownSection />
      <ResultsSection />
      <VoteSection />
    </Flex>
  );
};
