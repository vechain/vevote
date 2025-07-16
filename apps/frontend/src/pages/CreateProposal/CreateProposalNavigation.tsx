import { PageContainer } from "@/components/PageContainer";
import { useI18nContext } from "@/i18n/i18n-react";
import { CreateProposalStep } from "@/types/proposal";
import { Box, Button, Flex, Heading, Icon, Text, useDisclosure } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";
import { ExitModal } from "./ExitModal";
import { CloseIcon } from "@/icons";

export const CreateProposalNavigation = () => {
  const { step } = useCreateProposal();
  const { LL } = useI18nContext();

  const { isOpen: isExitOpen, onClose: onExitClose, onOpen: onExitOpen } = useDisclosure();

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
      paddingX={{ base: 6, md: 12, lg: 24 }}
      paddingY={{ base: 4, md: 16 }}
      boxShadow={"0px 0px 12px 1px rgba(0,0,0,0.06)"}
      background={"white"}>
      <Flex flexDirection={"column"} alignItems={"start"} gap={4} width={"full"}>
        <Flex width={"full"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
          <Heading fontSize={{ base: "18px", md: "30px" }} fontWeight={"semibold"} color="primary.700">
            {LL.proposal.create.title()}
          </Heading>
          <Button
            hideFrom={"md"}
            variant={"secondary"}
            marginLeft={"auto"}
            alignItems={"center"}
            size={{ base: "md", md: "lg" }}
            gap={2}
            onClick={onExitOpen}
            rightIcon={<Icon as={CloseIcon} />}>
            {LL.exit()}
          </Button>
        </Flex>
        <Flex flexDirection={"column"} gap={2}>
          <ProgressBar />
          <Text fontSize={{ base: "14px", md: "18px" }} color={"gray.600"}>
            {description}
          </Text>
        </Flex>
      </Flex>

      <Button
        hideBelow={"md"}
        variant={"secondary"}
        marginLeft={"auto"}
        alignItems={"center"}
        size={{ base: "md", md: "lg" }}
        gap={2}
        onClick={onExitOpen}
        rightIcon={<Icon as={CloseIcon} />}>
        {LL.exit()}
      </Button>
      <ExitModal isExitOpen={isExitOpen} onExitClose={onExitClose} />
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
