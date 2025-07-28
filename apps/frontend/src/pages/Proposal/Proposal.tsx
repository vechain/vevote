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
import { Box, Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { Routes } from "@/types/routes";
import { NewVotingCard } from "./components/NewVotingCard";
import { NewTimelineCard } from "./components/NewTimelineCard";
import { NewBuyNodeCta } from "./components/NewBuyNodeCta";
import { NewProposalHeader } from "./components/NewProposalHeader";
import { NewDescriptionSection } from "./components/NewDescriptionSection";
import { ProposalNavbar } from "./components/ProposalNavbar";

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

  useEffect(() => {
    if (params.proposalId === "draft" && !account?.address) navigate(Routes.HOME);
  }, [account?.address, navigate, params.proposalId]);

  return (
    <Box bg={"white"}>
      <ProposalNavbar />

      {isLoading ? (
        <PageContainer
          padding={0}
          paddingX={{ base: "20px", md: "40px" }}
          paddingTop={{ base: "112px", md: "192px" }}
          paddingBottom={{ base: 10, md: 20 }}>
          <SingleProposalSkeleton />
        </PageContainer>
      ) : !proposal ? (
        <Box>{"Proposal not found"}</Box>
      ) : (
        <ProposalProvider proposal={proposal}>
          <PageContainer bg={"white"}>
            {/* New layout structure */}
            <Flex
              flexDirection={{ base: "column-reverse", md: "column-reverse" }}
              gap={{ base: "40px", md: "48px" }}
              width={"full"}>
              {/* Breadcrumbs */}
              <Flex gap={1} alignItems={"center"} fontSize={"14px"} fontWeight={500} order={3}>
                <Text color={"gray.600"}>{LL.homepage()}</Text>
                <Text color={"gray.400"}>{"→"}</Text>
                <Text color={"gray.600"}>{LL.proposal.title()}</Text>
              </Flex>

              {/* Main content area */}
              <Flex
                flexDirection={{ base: "column", md: "row" }}
                gap={{ base: "24px", md: "64px" }}
                alignItems={"start"}
                order={2}>
                {/* Left column - Main content */}
                <Flex flexDirection={"column"} flex={1} minW={0} gap={12}>
                  {/* Proposal Header with status badge and proposer info */}
                  <NewProposalHeader />

                  {/* Proposal title */}
                  <Text fontSize={{ base: "20px", md: "24px" }} fontWeight={500} color={"gray.800"} lineHeight={"1.33"}>
                    {proposal.title}
                  </Text>

                  {/* Title and Description */}
                  <NewDescriptionSection />
                </Flex>

                {/* Right column - Voting and Timeline cards */}
                {!isMobile && (
                  <Flex flexDirection={"column"} gap={6} minW={"480px"}>
                    <NewVotingCard />
                    <NewTimelineCard />
                  </Flex>
                )}

                {/* Mobile: Voting and Timeline cards below description */}
                {isMobile && (
                  <Flex flexDirection={"column"} gap={6} width={"100%"}>
                    <NewVotingCard />
                  </Flex>
                )}
              </Flex>

              {/* Buy Node CTA */}
              <NewBuyNodeCta order={1} />
            </Flex>
          </PageContainer>
        </ProposalProvider>
      )}
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
