import { PageContainer } from "@/components/PageContainer";
// import { CancelProposal } from "@/components/proposal/CancelProposal";
// import { DeleteEditProposal } from "@/components/proposal/DeleteEditProposal";
// import { ExecuteModal } from "@/components/proposal/ExecuteModal";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { SingleProposalSkeleton } from "@/components/ui/SingleProposalSkeleton";
// import { VotedChip } from "@/components/ui/VotedChip";
// import { useUser } from "@/contexts/UserProvider";
// import { useHasVoted } from "@/hooks/useCastVote";
import { useProposalEvents } from "@/hooks/useProposalEvent";
import { useI18nContext } from "@/i18n/i18n-react";
// import { ProposalCardType } from "@/types/proposal";
import { Box, Flex, Stack, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { Routes } from "@/types/routes";
import { BuyNodeCta } from "./components/BuyNodeCta";
import { ProposalHeader } from "./components/ProposalHeader";
import { DescriptionSection } from "./components/DescriptionSection";
import { ProposalNavbar } from "./components/ProposalNavbar";
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
      <Box bg={"white"}>
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
        <Box>{"Proposal not found"}</Box>
      </Box>
    );
  }

  return (
    <Box bg={"white"}>
      <ProposalNavbar />
      <ProposalProvider proposal={proposal}>
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
      </ProposalProvider>
    </Box>
  );
};

// const ProposalNavbarActions = ({ proposal }: { proposal: ProposalCardType | undefined }) => {
//   const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });
//   const { isExecutor, isWhitelisted } = useUser();

//   const canCancel = useMemo(
//     () => isWhitelisted && ["upcoming"].includes(proposal?.status || ""),
//     [isWhitelisted, proposal?.status],
//   );

//   const canEditDraft = useMemo(
//     () => isWhitelisted && ["draft"].includes(proposal?.status || ""),
//     [isWhitelisted, proposal?.status],
//   );

//   return (
//     <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
//       {canEditDraft && <DeleteEditProposal />}
//       {canCancel && <CancelProposal proposalId={proposal?.id} />}
//       {isExecutor && proposal?.status === "approved" && <ExecuteModal proposalId={proposal?.id} />}

//       {["voting"].includes(proposal?.status || "") && hasVoted && <VotedChip />}
//     </Flex>
//   );
// };
