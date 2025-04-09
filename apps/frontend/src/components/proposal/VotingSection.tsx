import { useI18nContext } from "@/i18n/i18n-react";
import { VotingEnum } from "@/types/proposal";
import { Box, BoxProps, Flex, Heading, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { MdOutlineHowToVote } from "react-icons/md";
import { useProposal } from "./ProposalProvider";
import { VotingMultipleOptions, VotingSingleChoice, VotingSingleOption } from "./VotingList";

export const VotingSection = () => {
  const { proposal } = useProposal();
  return (
    <VotingSectionContainer>
      <VotingSectionHeader />
      <VotingSectionContent>
        {proposal.votingType === VotingEnum.SINGLE_CHOICE && <VotingSingleChoice proposal={proposal} />}
        {proposal.votingType === VotingEnum.SINGLE_OPTION && <VotingSingleOption proposal={proposal} />}
        {proposal.votingType === VotingEnum.MULTIPLE_OPTIONS && <VotingMultipleOptions proposal={proposal} />}
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
        paddingY={10}
        paddingX={11}
        flexDirection={"column"}
        alignItems={"start"}
        gap={6}>
        <Heading fontSize={20} fontWeight={600} color="primary.700" display={"flex"} gap={2} alignItems={"center"}>
          <MdOutlineHowToVote />
          {LL.voting()}
        </Heading>
        <Text fontSize={24} color={"gray.600"} fontWeight={500}>
          {proposal.question}
        </Text>
      </Flex>
    </SectionLimiter>
  );
};

const VotingSectionContent = ({ children }: PropsWithChildren) => {
  return (
    <Box paddingY={10} paddingX={11} maxWidth={"864px"} marginX={"auto"} width={"100%"}>
      {children}
    </Box>
  );
};

const SectionLimiter = ({ children, ...restProps }: BoxProps) => {
  return (
    <Box paddingY={10} paddingX={11} {...restProps}>
      {children}
    </Box>
  );
};
