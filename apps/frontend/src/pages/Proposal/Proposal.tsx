import { ProposalNavbar } from "@/components/navbar/Navbar";
import { PageContainer } from "@/components/PageContainer";
import { useI18nContext } from "@/i18n/i18n-react";
import { mockProposals } from "@/utils/mock";
import { Button, Flex, Grid, Heading, Icon, Image, Link, Text } from "@chakra-ui/react";
import { useParams } from "react-router";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { PropsWithChildren, useMemo } from "react";
import { IconBadge } from "@/components/ui/IconBadge";
import { ProposalCardType } from "@/types/proposal";
import { IconType } from "react-icons";
import { FaRegEdit } from "react-icons/fa";
import { LuCalendarCheck, LuUsers } from "react-icons/lu";
import { CopyLink } from "@/components/ui/CopyLink";
import { formatAddress } from "@/utils/address";
import { useFormatDate } from "@/hooks/useFormatDate";
import { MdOutlineArrowOutward } from "react-icons/md";
import { InfoBox } from "@/components/ui/InfoBox";

const VECHAIN_EXPLORER_URL = process.env.PUBLIC_VECHAIN_EXPLORER_URL ?? "https://explore-testnet.vechain.org"; //todo: add env variable

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
      <Flex flexDirection={"column"} gap={6} alignItems={"start"}>
        <IconBadge variant={proposal.status} />
        <Heading fontSize={32} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
      </Flex>
      <Flex flexDirection={"column"} gap={4} alignItems={"start"}>
        <Heading fontSize={20} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
        {/* TODO: Add text editor read only */}
        <Text fontSize={18} fontWeight={600} color="gray.600">
          {proposal.description}
        </Text>
      </Flex>
      <DetailsCards proposal={proposal} />
      <InfoBox variant={infoVariant} />
    </PageContainer.Header>
  );
};

const DetailsCards = ({ proposal }: { proposal: ProposalCardType }) => {
  const { LL } = useI18nContext();

  const { formattedProposalDate } = useFormatDate();
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={6} width={"100%"}>
      <DetailsCardsItem title={LL.proposal.proposed_by()} icon={FaRegEdit}>
        <Flex gap={2} alignItems={"start"} flexDirection={"column"}>
          <Flex gap={2} alignItems={"center"}>
            <Text fontWeight={500} color="gray.600">
              {LL.proposal.vechain_foundation()}
            </Text>
            <CopyLink
              isExternal
              textToCopy={proposal.address}
              color={"primary.500"}
              fontWeight={500}
              href={`${VECHAIN_EXPLORER_URL}/accounts/${proposal.address}`}>
              {formatAddress(proposal.address)}
            </CopyLink>
          </Flex>
          <Flex gap={3} alignItems={"center"}>
            <Text color="gray.500">{LL.on()}</Text>
            <Text color="gray.600" fontWeight={500}>
              {formattedProposalDate(proposal.createdAt)}
            </Text>
          </Flex>
        </Flex>
      </DetailsCardsItem>
      <DetailsCardsItem title={LL.proposal.voting_calendar()} icon={LuCalendarCheck}>
        <Flex gap={2} alignItems={"start"} flexDirection={"column"}>
          <Flex gap={3} alignItems={"center"}>
            <Text minW={10} color="gray.500">
              {LL.start()}
            </Text>
            <Text color="gray.600" fontWeight={500}>
              {formattedProposalDate(proposal.startDate)}
            </Text>
          </Flex>

          <Flex gap={3} alignItems={"center"}>
            <Text minW={10} color="gray.500">
              {LL.end()}
            </Text>
            <Text color="gray.600" fontWeight={500}>
              {formattedProposalDate(proposal.endDate)}
            </Text>
          </Flex>
        </Flex>
      </DetailsCardsItem>
      <DetailsCardsItem title={LL.proposal.who_can_vote()} icon={LuUsers}>
        <Flex gap={2} alignItems={"start"} flexDirection={"column"}>
          <Text color="gray.600">{LL.proposal.node_holders()}</Text>
          <Link
            isExternal
            display={"flex"}
            alignItems={"center"}
            gap={2}
            color="primary.500"
            href="https://vechain.org/">
            {LL.learn_more()}
            <MdOutlineArrowOutward />
          </Link>
        </Flex>
      </DetailsCardsItem>
    </Grid>
  );
};

type DetailsCardsItemProps = PropsWithChildren<{
  icon: IconType;
  title: string;
}>;

const DetailsCardsItem = ({ icon, title, children }: DetailsCardsItemProps) => {
  return (
    <Flex flex={1} flexDirection={"column"} padding={10} gap={6} alignItems={"start"} borderRadius={16} bg={"gray.100"}>
      <Heading fontSize={20} fontWeight={600} color="primary.700" display={"flex"} gap={4} alignItems={"center"}>
        <Icon as={icon} boxSize={6} color="primary.700" />
        {title}
      </Heading>
      {children}
    </Flex>
  );
};
