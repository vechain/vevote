import { ProposalNavbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { BuyANode } from "@/components/proposal/BuyANode";
import { CancelProposal } from "@/components/proposal/CancelProposal";
import { DeleteEditProposal } from "@/components/proposal/DeleteEditProposal";
import { ExecuteModal } from "@/components/proposal/ExecuteModal";
import { ProposalDetailsCards } from "@/components/proposal/ProposalDetailsCards";
import { ProposalInfoBox } from "@/components/proposal/ProposalInfoBox";
import { ProposalInfos } from "@/components/proposal/ProposalInfos";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { VotingSection } from "@/components/proposal/VotingSection";
import { BackButton } from "@/components/ui/BackButton";
import { useUser } from "@/contexts/UserProvider";
import { useHasVoted } from "@/hooks/useCastVote";
import { useProposalEvents } from "@/hooks/useProposalEvent";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowRightIcon, CheckSquareIcon } from "@/icons";
import { ProposalCardType } from "@/types/proposal";
import { sanitizeImageUrl } from "@/utils/proposals/helpers";
import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useMemo } from "react";
import { useParams } from "react-router";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";

export const Proposal = () => {
  const { LL } = useI18nContext();
  const { draftProposal } = useCreateProposal();
  const { account } = useWallet();
  const params = useParams();

  const proposalId = useMemo(() => {
    if (params.proposalId !== "draft") return params.proposalId;
    return undefined;
  }, [params.proposalId]);

  const { proposal: proposalData, isLoading } = useProposalEvents({ proposalId });

  const proposal = useMemo(() => {
    if (params.proposalId === "draft") return draftProposal || undefined;
    return proposalData;
  }, [draftProposal, params.proposalId, proposalData]);

  return (
    <>
      <ProposalNavbar>
        <Flex alignItems={"center"} gap={6} width={"full"}>
          <BackButton />
          <Text
            display={{ base: "none", md: "flex" }}
            fontSize={"14px"}
            color={"primary.200"}
            alignItems={"center"}
            gap={1}>
            {LL.homepage()} <Icon as={ArrowRightIcon} width={5} height={4} /> {LL.proposal.title()}
          </Text>
          {account?.address && <ProposalNavbarActions proposal={proposal} />}
        </Flex>
      </ProposalNavbar>

      {!proposal ? (
        <Box>{"Proposal not found"}</Box>
      ) : (
        <ProposalProvider proposal={proposal}>
          <PageContainer
            padding={0}
            paddingX={{ base: "20px", md: "40px" }}
            paddingTop={{ base: "112px", md: "192px" }}
            paddingBottom={{ base: 10, md: 20 }}
            bg={"white"}>
            {isLoading ? (
              <Box>{"Loading"}</Box>
            ) : (
              <Flex flexDirection={"column"} gap={10} width={"full"}>
                <Image
                  src={sanitizeImageUrl(proposal.headerImage?.url)}
                  borderRadius={16}
                  alt="Proposal Header"
                  width={"100%"}
                  aspectRatio={"5/2"}
                  objectFit={"cover"}
                />
                <PageContainer.Header flexDirection={"column"} gap={10} alignItems={"start"}>
                  <ProposalInfos />
                  <ProposalDetailsCards />
                  <ProposalInfoBox canceledReason={proposal.reason} />
                </PageContainer.Header>
                {proposal.status !== "canceled" && (
                  <>
                    <VotingSection />
                    <BuyANode />
                  </>
                )}
              </Flex>
            )}
          </PageContainer>
        </ProposalProvider>
      )}
    </>
  );
};

const ProposalNavbarActions = ({ proposal }: { proposal: ProposalCardType | undefined }) => {
  const { LL } = useI18nContext();
  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });
  const { isExecutor, isWhitelisted } = useUser();

  const canCancel = useMemo(
    () => isWhitelisted && ["upcoming"].includes(proposal?.status || ""),
    [isWhitelisted, proposal?.status],
  );

  const canEditDraft = useMemo(
    () => isWhitelisted && ["draft"].includes(proposal?.status || ""),
    [isWhitelisted, proposal?.status],
  );

  return (
    <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
      {canEditDraft && <DeleteEditProposal />}
      {canCancel && <CancelProposal proposalId={proposal?.id} />}

      {isExecutor && proposal?.status === "approved" && <ExecuteModal proposalId={proposal?.id} />}

      {["voting"].includes(proposal?.status || "") && hasVoted && (
        <Button variant={"feedback"} rightIcon={<Icon as={CheckSquareIcon} />}>
          {LL.voted()}
        </Button>
      )}
    </Flex>
  );
};
