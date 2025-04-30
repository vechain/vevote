import { ProposalNavbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { ProposalDetailsCards } from "@/components/proposal/ProposalDetailsCards";
import { ProposalInfoBox } from "@/components/proposal/ProposalInfoBox";
import { ProposalInfos } from "@/components/proposal/ProposalInfos";
import { ProposalProvider, useProposal } from "@/components/proposal/ProposalProvider";
import { VotingSection } from "@/components/proposal/VotingSection";
import { useI18nContext } from "@/i18n/i18n-react";
import { mockProposals } from "@/utils/mock";
import { Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { useParams } from "react-router";

import { MdOutlineHowToVote } from "react-icons/md";
import { FiCheckSquare } from "react-icons/fi";
import { DeleteEditProposal } from "@/components/proposal/DeleteEditProposal";
import { CancelEditProposal } from "@/components/proposal/CancelEditProposal";
import { useWallet } from "@vechain/vechain-kit";
import { BuyANode } from "@/components/proposal/BuyANode";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";

export const Proposal = () => {
  const { LL } = useI18nContext();
  const { draftProposal } = useCreateProposal();
  const { account } = useWallet();
  const params = useParams();

  //todo: replace with real data
  const proposal = useMemo(() => {
    if (params.id === "draft") return draftProposal;
    return mockProposals.find(proposal => proposal.id === params.proposalId);
  }, [draftProposal, params.id, params.proposalId]);

  if (!proposal) return <div>Proposal not found</div>;

  return (
    <ProposalProvider proposal={proposal}>
      <ProposalNavbar>
        <Flex alignItems={"center"} gap={6} width={"full"}>
          <Button as={Link} gap={2} alignItems={"center"} href="/" variant={"secondary"}>
            <IoArrowBack />
            {LL.back()}
          </Button>
          <Text display={"flex"} fontSize={"14px"} color={"primary.200"} alignItems={"center"} gap={1}>
            {LL.homepage()} <IoArrowForward /> {LL.proposal.title()}
          </Text>
          {account?.address && <ProposalNavbarActions />}
        </Flex>
      </ProposalNavbar>
      <PageContainer paddingTop={"200px"}>
        <Image
          src={proposal.headerImage?.url}
          borderRadius={16}
          alt="Proposal Header"
          width={"100%"}
          aspectRatio={"5/2"}
          objectFit={"cover"}
        />
        <PageContainer.Header flexDirection={"column"} gap={10} alignItems={"start"}>
          <ProposalInfos />
          <ProposalDetailsCards />
          <ProposalInfoBox />
        </PageContainer.Header>
        {proposal.status !== "canceled" && <VotingSection />}
        <BuyANode />
      </PageContainer>
    </ProposalProvider>
  );
};

//todo: get from provider
const isAdmin = true;
const isExecutor = false;
const isVoter = false;
const hasVotes = false;

const ProposalNavbarActions = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const onVote = () => {
    console.log("Vote");
  };

  return (
    <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
      {isAdmin && ["draft"].includes(proposal.status) && <DeleteEditProposal />}

      {isAdmin && ["upcoming", "voting"].includes(proposal.status) && <CancelEditProposal />}

      {isExecutor && proposal.status === "approved" && (
        <Button variant={"feedback"}>{LL.proposal.mark_as_executed()}</Button>
      )}

      {isVoter &&
        (hasVotes ? (
          <Button variant={"feedback"}>
            {LL.voted()}
            <FiCheckSquare />
          </Button>
        ) : (
          <Button onClick={onVote}>
            <MdOutlineHowToVote />
            {LL.vote()}
          </Button>
        ))}
    </Flex>
  );
};
