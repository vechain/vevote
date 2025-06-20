import { ProposalNavbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { ProposalDetailsCards } from "@/components/proposal/ProposalDetailsCards";
import { ProposalInfoBox } from "@/components/proposal/ProposalInfoBox";
import { ProposalInfos } from "@/components/proposal/ProposalInfos";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { VotingSection } from "@/components/proposal/VotingSection";
import { useI18nContext } from "@/i18n/i18n-react";
import { Box, Button, Flex, Icon, Image, Link, Text } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { DeleteEditProposal } from "@/components/proposal/DeleteEditProposal";
import { useWallet } from "@vechain/vechain-kit";
import { BuyANode } from "@/components/proposal/BuyANode";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { sanitizeImageUrl } from "@/utils/proposals/helpers";
import { useProposalEvents } from "@/hooks/useProposalEvent";
import { ProposalCardType } from "@/types/proposal";
import { useHasVoted } from "@/hooks/useCastVote";
import { useUser } from "@/contexts/UserProvider";
import { ArrowLeftIcon, ArrowRightIcon, CheckSquareIcon, VoteIcon } from "@/icons";
import { CancelProposal } from "@/components/proposal/CancelProposal";
import { analytics } from "@/utils/mixpanel/mixpanel";

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

  useEffect(() => {
    analytics.trackPageView(`Proposal page viewed: ${params.proposalId || "draft"}`);
  }, [params.proposalId]);

  return (
    <>
      <ProposalNavbar>
        <Flex alignItems={"center"} gap={6} width={"full"}>
          <Button
            as={Link}
            gap={2}
            alignItems={"center"}
            href="/"
            variant={"secondary"}
            leftIcon={<Icon as={ArrowLeftIcon} />}>
            {LL.back()}
          </Button>
          <Text display={"flex"} fontSize={"14px"} color={"primary.200"} alignItems={"center"} gap={1}>
            {LL.homepage()} <Icon as={ArrowRightIcon} width={5} height={4} /> {LL.proposal.title()}
          </Text>
          {account?.address && <ProposalNavbarActions proposal={proposal} />}
        </Flex>
      </ProposalNavbar>

      {!proposal ? (
        <Box>{"Proposal not found"}</Box>
      ) : (
        <ProposalProvider proposal={proposal}>
          <PageContainer paddingTop={"200px"} bg={"white"}>
            {isLoading ? (
              <Box>{"Loading"}</Box>
            ) : (
              <>
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
                {proposal.status !== "canceled" && <VotingSection />}
                <BuyANode />
              </>
            )}
          </PageContainer>
        </ProposalProvider>
      )}
    </>
  );
};

const ProposalNavbarActions = ({ proposal }: { proposal: ProposalCardType | undefined }) => {
  const { LL } = useI18nContext();
  const { account } = useWallet();

  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });
  const { isExecutor, isWhitelisted, isVoter } = useUser();

  const canVote = useMemo(
    () => account?.address !== proposal?.proposer && isVoter,
    [account?.address, isVoter, proposal?.proposer],
  );

  const canCancel = useMemo(
    () => isWhitelisted && account?.address === proposal?.proposer,
    [account?.address, isWhitelisted, proposal?.proposer],
  );

  return (
    <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
      {isWhitelisted && ["draft"].includes(proposal?.status || "") && <DeleteEditProposal />}

      {canCancel && ["upcoming"].includes(proposal?.status || "") && <CancelProposal proposalId={proposal?.id} />}

      {isExecutor && proposal?.status === "approved" && (
        <Button variant={"feedback"}>{LL.proposal.mark_as_executed()}</Button>
      )}

      {canVote &&
        (hasVoted ? (
          <Button variant={"feedback"} rightIcon={<Icon as={CheckSquareIcon} />}>
            {LL.voted()}
          </Button>
        ) : (
          <Button leftIcon={<Icon as={VoteIcon} />}>{LL.vote()}</Button>
        ))}
    </Flex>
  );
};
