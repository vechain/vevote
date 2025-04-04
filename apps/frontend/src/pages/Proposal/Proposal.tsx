import { ProposalNavbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { ProposalDetailsCards } from "@/components/ProposalDetailsCards";
import { ProposalInfos } from "@/components/ProposalInfos";
import { InfoBox } from "@/components/ui/InfoBox";
import { VotingSection } from "@/components/VotingSection";
import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType } from "@/types/proposal";
import { mockProposals } from "@/utils/mock";
import { Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { useParams } from "react-router";

export const Proposal = () => {
  const { LL } = useI18nContext();
  const params = useParams();

  const proposal = useMemo(
    () => mockProposals.find(proposal => proposal.id === params.proposalId),
    [params.proposalId],
  );

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  return (
    <>
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
      <PageContainer minH={"300vh"} paddingTop={"200px"}>
        <Image
          src={proposal.headerImage}
          borderRadius={16}
          alt="Proposal Header"
          width={"100%"}
          aspectRatio={"5/2"}
          objectFit={"cover"}
        />
        <ProposalHeader proposal={proposal} />
        <VotingSection proposal={proposal} />
      </PageContainer>
    </>
  );
};

const ProposalHeader = ({ proposal }: { proposal: ProposalCardType }) => {
  const infoVariant = useMemo(() => {
    switch (proposal.status) {
      case "voting":
      case "upcoming":
        return "info";
      case "approved":
        return "approved";
      case "executed":
        return "executed";
      case "canceled":
        return "canceled";
      case "rejected":
        return "rejected";
      default:
        return "info";
    }
  }, [proposal.status]);

  return (
    <PageContainer.Header flexDirection={"column"} gap={10} alignItems={"start"}>
      <ProposalInfos proposal={proposal} />
      <ProposalDetailsCards proposal={proposal} />
      <InfoBox variant={infoVariant} />
    </PageContainer.Header>
  );
};
