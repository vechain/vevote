import { PageContainer } from "@/components/PageContainer";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useCreateProposal } from "./CreateProposalProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { CreateProposalStep } from "@/types/proposal";
import { IoMdClose } from "react-icons/io";

export const CreateProposalNavigation = () => {
  const { step } = useCreateProposal();
  const { LL } = useI18nContext();

  const description = useMemo(() => {
    switch (step) {
      case CreateProposalStep.VOTING_DETAILS:
        return LL.proposal.create.voting_details_desc();
      case CreateProposalStep.VOTING_SETUP:
        return LL.proposal.create.voting_setup_desc();
      case CreateProposalStep.VOTING_SUMMARY:
        return LL.proposal.create.voting_summary_desc();
    }
  }, [LL.proposal.create, step]);
  return (
    <PageContainer.Header
      paddingX={20}
      paddingY={10}
      boxShadow={"0px 0px 12px 1px rgba(0,0,0,0.06)"}
      background={"white"}>
      <Flex flexDirection={"column"} alignItems={"start"} gap={6}>
        <Heading fontSize={30} fontWeight={600} color="primary.700">
          {LL.proposal.create.title()}
        </Heading>
        <Flex flexDirection={"column"} gap={2}>
          <ProgressBar />
          <Text fontSize={"18px"} color={"gray.600"}>
            {description}
          </Text>
        </Flex>
      </Flex>
      <Button as={Link} href="/proposals" marginLeft={"auto"} alignItems={"center"} gap={2}>
        {LL.exit()}
        <IoMdClose />
      </Button>
    </PageContainer.Header>
  );
};

const ProgressBar = () => {
  const { step } = useCreateProposal();
  const { LL } = useI18nContext();
  const stepString = useMemo(() => {
    return LL.proposal.create.steps({
      current: step + 1,
      total: 3,
    });
  }, [LL.proposal.create, step]);
  return (
    <Flex gap={"12px"} alignItems={"center"}>
      <Text minWidth={"45px"} color={"gray.500"} fontWeight={"500"}>
        {stepString}
      </Text>
      <Box width={"80px"} height={"4px"} backgroundColor={"gray.200"} borderRadius={"full"}>
        <motion.div
          style={{ borderRadius: "full", backgroundColor: "#6042dd", height: "100%" }}
          initial={{ width: "33.33%" }}
          animate={{ width: `${(step + 1) * 33.33}%` }}
        />
      </Box>
    </Flex>
  );
};
