import { useProposal } from "@/components/proposal/ProposalProvider";
import { isHistoricalProposalMerged } from "@/utils/proposals/historicalProposal";
import { Flex, useDisclosure } from "@chakra-ui/react";
import { useMemo } from "react";
import { CountdownSection } from "./components/CountdownSection";
import { ResultsSection } from "./components/ResultsSection/ResultsSection";
import { SubmitVoteModal } from "./components/SubmitVoteModal";
import { VoteSection } from "./components/VoteSection";
import { HistoricalResults } from "./HistoricalResults";

export const VotingCard = () => {
  const submitVoteModal = useDisclosure();
  const { proposal } = useProposal();

  const isHistorical = useMemo(() => proposal && isHistoricalProposalMerged(proposal), [proposal]);

  if (isHistorical) return <HistoricalResults proposal={proposal} />;

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
