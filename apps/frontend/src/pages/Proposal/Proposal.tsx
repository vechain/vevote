import { PageContainer } from "@/components/PageContainer";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { SingleProposalSkeleton } from "@/components/ui/SingleProposalSkeleton";
import { useProposalEvents } from "@/hooks/useProposalEvent";
import { useI18nContext } from "@/i18n/i18n-react";
import { Box, Flex, Stack, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { Routes } from "@/types/routes";
import { BuyNodeCta } from "./components/BuyNodeCta";
import { ProposalHeader } from "./components/ProposalHeader";
import { DescriptionSection } from "./components/DescriptionSection";
import { ProposalNavbar } from "./components/ProposalNavbar/ProposalNavbar";
import { VotingAndTimeline } from "./components/VotingAndTimeline/VotingAndTimeline";
import { ProposalStatus } from "@/types/proposal";
import { CanceledProposal } from "./components/CanceledProposal";

export const Proposal = () => {
  const { LL } = useI18nContext();
  const { draftProposal } = useCreateProposal();
  const { account } = useWallet();
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const proposalId = useMemo(() => {
    if (params.proposalId !== "draft") return params.proposalId;
    return undefined;
  }, [params.proposalId]);

  const { proposal: proposalData, isLoading } = useProposalEvents({ proposalId });

  const proposal = useMemo(() => {
    if (params.proposalId === "draft") return draftProposal || undefined;
    return proposalData;
  }, [draftProposal, params.proposalId, proposalData]);

  const isCanceled = proposal?.status === ProposalStatus.CANCELED;

  useEffect(() => {
    if (params.proposalId === "draft" && !account?.address) navigate(Routes.HOME);
  }, [account?.address, navigate, params.proposalId]);

  if (isLoading) {
    return (
      <Box bg={"white"} pt={{ base: 24, md: 32 }}>
        <ProposalNavbar />
        <PageContainer>
          <SingleProposalSkeleton />
        </PageContainer>
      </Box>
    );
  }

  if (!proposal) {
    return (
      <Box bg={"white"}>
        <ProposalNavbar />
        <Box>{LL.proposal.proposal_not_found()}</Box>
      </Box>
    );
  }

  return (
    <ProposalProvider proposal={proposal}>
      <Box bg={"white"}>
        <ProposalNavbar />
        <PageContainer bg={"white"} pt={{ base: 24, md: 32 }} pb={10}>
          <VStack gap={10} w={"full"} alignItems={"stretch"}>
            <Flex gap={1} alignItems={"center"} fontSize={"14px"} fontWeight={500}>
              <Text color={"gray.600"} onClick={() => navigate(Routes.HOME)} cursor={"pointer"}>
                {LL.homepage()}
              </Text>
              <Text color={"gray.400"}>{"→"}</Text>
              <Text color={"gray.600"}>{LL.proposal.title()}</Text>
            </Flex>
            <Stack direction={{ base: "column", md: "row" }} w={"full"} gap={{ base: 10, md: 12 }}>
              <VStack gap={10} align="stretch" flex={2}>
                <ProposalHeader />
                <Text fontSize={{ base: "20px", md: "24px" }} fontWeight={500} color={"gray.800"} lineHeight={"1.33"}>
                  {proposal.title}
                </Text>
                {!isMobile && <DescriptionSection />}
              </VStack>
              <VStack gap={10} align="stretch" flex={1}>
                {!isCanceled ? <VotingAndTimeline /> : <CanceledProposal />}
                {isMobile && <DescriptionSection />}
              </VStack>
            </Stack>
            <BuyNodeCta />
          </VStack>
        </PageContainer>
      </Box>
    </ProposalProvider>
  );
};
