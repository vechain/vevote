import { useIndexerVoteResults } from "@/hooks/useCastVote";
import { useI18nContext } from "@/i18n/i18n-react";
import { VoteIcon } from "@/icons";
import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { useProposal } from "./ProposalProvider";
import { SectionLimiter } from "./SectionLimiter";
import { VotingSingleChoice } from "./VotingList";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";

export const VotingSection = () => {
  const { proposal } = useProposal();
  const { results } = useIndexerVoteResults({ proposalId: proposal.id, size: defaultSingleChoice.length });
  return (
    <VotingSectionContainer>
      <VotingSectionHeader />
      <VotingSectionContent>
        <VotingSingleChoice proposal={proposal} results={results} />
      </VotingSectionContent>
    </VotingSectionContainer>
  );
};

const VotingSectionContainer = ({ children }: PropsWithChildren) => {
  return (
    <Flex flexDirection={"column"} width={"100%"} borderRadius={16} background={"gray.50"}>
      {children}
    </Flex>
  );
};

const VotingSectionHeader = () => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();
  return (
    <SectionLimiter borderBottomWidth={2} borderBottomColor={"gray.300"}>
      <Flex
        maxWidth={"864px"}
        marginX={"auto"}
        paddingX={{ md: 11 }}
        flexDirection={"column"}
        alignItems={"start"}
        gap={6}>
        <Heading
          fontSize={{ base: 16, md: 20 }}
          fontWeight={600}
          color="primary.700"
          display={"flex"}
          gap={2}
          alignItems={"center"}>
          <Icon as={VoteIcon} />
          {LL.voting()}
        </Heading>
        <Text fontSize={{ base: 16, md: 24 }} color={"gray.600"} fontWeight={500}>
          {proposal.votingQuestion}
        </Text>
      </Flex>
    </SectionLimiter>
  );
};

const VotingSectionContent = ({ children }: PropsWithChildren) => {
  return (
    <SectionLimiter maxWidth={"864px"} marginX={"auto"} width={"100%"}>
      {children}
    </SectionLimiter>
  );
};
