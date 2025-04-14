import { ProposalNavbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { ProposalDetailsCards } from "@/components/proposal/ProposalDetailsCards";
import { ProposalInfoBox } from "@/components/proposal/ProposalInfoBox";
import { ProposalInfos } from "@/components/proposal/ProposalInfos";
import { ProposalProvider } from "@/components/proposal/ProposalProvider";
import { VotingSection } from "@/components/proposal/VotingSection";
import { useI18nContext } from "@/i18n/i18n-react";
import { mockProposals } from "@/utils/mock";
import { Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { useParams } from "react-router";

export const Proposal = () => {
  const { LL } = useI18nContext();
  const params = useParams();

  //todo: replace with real data
  const proposal = useMemo(
    () => mockProposals.find(proposal => proposal.id === params.proposalId),
    [params.proposalId],
  );

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  return (
    <ProposalProvider proposal={proposal}>
      <ProposalNavbar>
        <Flex alignItems={"center"} gap={6}>
          <Button as={Link} gap={2} alignItems={"center"} href="/">
            <IoArrowBack />
            {LL.back()}
          </Button>
          <Text display={"flex"} fontSize={"14px"} color={"primary.200"} alignItems={"center"} gap={1}>
            {LL.homepage()} <IoArrowForward /> {LL.proposal.title()}
          </Text>
        </Flex>
      </ProposalNavbar>
      <PageContainer paddingTop={"200px"}>
        <Image
          src={proposal.headerImage}
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
        {/* todo: Add Buy a node info box */}
        {/* <BuyANode/> */}
      </PageContainer>
    </ProposalProvider>
  );
};
