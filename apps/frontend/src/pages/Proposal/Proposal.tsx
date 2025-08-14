import { Navbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { SingleProposalSkeleton } from "@/components/ui/SingleProposalSkeleton";
import { useProposalEvent } from "@/hooks/useProposalEvent";
import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalStatus } from "@/types/proposal";
import { Routes } from "@/types/routes";
import { Box, Flex, Heading, Stack, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { BuyNodeCta } from "./components/BuyNodeCta";
import { CanceledProposal } from "./components/CanceledProposal";
import { DescriptionSection } from "./components/DescriptionSection";
import { ProposalHeader } from "./components/ProposalHeader";
import { VotingAndTimeline } from "./components/VotingAndTimeline/VotingAndTimeline";

export const Proposal = () => {
  const { LL } = useI18nContext();
  const { draftProposal } = useCreateProposal();
  const { account } = useWallet();
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const proposalId = useMemo(() => {
    if (params.proposalId !== "draft") return params.proposalId;
    return undefined;
  }, [params.proposalId]);

  const { proposal: proposalData, loading: isLoading } = useProposalEvent(proposalId);

  const proposal = useMemo(() => {
    if (params.proposalId === "draft") return draftProposal || undefined;
    return proposalData || undefined;
  }, [draftProposal, params.proposalId, proposalData]);

  const isCanceled = useMemo(() => proposal?.status === ProposalStatus.CANCELED, [proposal?.status]);

  useEffect(() => {
    if (params.proposalId === "draft" && !account?.address) navigate(Routes.HOME);
  }, [account?.address, navigate, params.proposalId]);

  if (isLoading) {
    return (
      <ProposalProvider proposal={proposal}>
        <Box bg={"white"}>
          <Navbar />
          <PageContainer bg={"white"} pt={{ base: 24, md: 32 }} pb={10}>
            <SingleProposalSkeleton />
          </PageContainer>
        </Box>
      </ProposalProvider>
    );
  }

  if (!isLoading && (!proposal || proposal.id === "default")) {
    navigate(`${Routes.HOME}?proposalNotFound=true`);
    return null;
  }

  return (
    <ProposalProvider proposal={proposal}>
      <Box bg={"white"}>
        <Navbar />
        <PageContainer bg={"white"} pt={{ base: 28, md: 32 }} variant="constrained">
          <VStack gap={10} w={"full"} alignItems={"stretch"}>
            <Flex gap={1} alignItems={"center"} fontSize={"14px"} fontWeight={500}>
              <Text color={"gray.600"} onClick={() => navigate(Routes.HOME)} cursor={"pointer"}>
                {LL.homepage()}
              </Text>
              <Text color={"gray.400"}>{"→"}</Text>
              <Text color={"gray.600"}>{LL.proposal.title()}</Text>
            </Flex>
            <Stack direction={{ base: "column", lg: "row" }} gap={{ base: 10, md: 12 }}>
              <VStack gap={10} align="stretch" flex={2}>
                <ProposalHeader />
                <Heading
                  maxWidth={{ lg: "530px" }}
                  fontWeight={600}
                  color={"gray.700"}
                  lineHeight={"1.33"}
                  fontSize={{ base: "20px", md: "30px" }}>
                  {proposal?.title}
                </Heading>
                {!isMobile && <DescriptionSection />}
              </VStack>
              <VStack gap={10} align="stretch" flex={1}>
                {!isCanceled ? <VotingAndTimeline /> : <CanceledProposal />}
                {isMobile && <DescriptionSection />}
                <BuyNodeCta />
              </VStack>
            </Stack>
          </VStack>
        </PageContainer>
      </Box>
    </ProposalProvider>
  );
};
