import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { Flex, Grid, Heading, Icon, Link, Text } from "@chakra-ui/react";
import { CopyLink } from "../ui/CopyLink";
import { formatAddress } from "@/utils/address";
import { PropsWithChildren, SVGProps } from "react";
import { useProposal } from "./ProposalProvider";
import { ArrowLinkIcon, CalendarCheckIcon, EditBoxIcon, UsersIcon } from "@/icons";
import { getConfig } from "@repo/config";

const VECHAIN_EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const ProposalDetailsCards = () => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={6} width={"100%"}>
      <DetailsCardsItem title={LL.proposal.proposed_by()} icon={EditBoxIcon}>
        <Flex gap={2} alignItems={"start"} flexDirection={"column"}>
          <Flex gap={2} alignItems={{ base: "start", md: "center" }} flexDirection={{ base: "column", md: "row" }}>
            <Text fontWeight={500} color="gray.600">
              {LL.proposal.vechain_foundation()}
            </Text>
            <CopyLink
              isExternal
              textToCopy={proposal.proposer}
              color={"primary.500"}
              fontWeight={500}
              href={`${VECHAIN_EXPLORER_URL}/accounts/${proposal.proposer}`}>
              {formatAddress(proposal.proposer)}
            </CopyLink>
          </Flex>
          <DateDetails date={proposal.createdAt} label={LL.on()} />
        </Flex>
      </DetailsCardsItem>
      <DetailsCardsItem title={LL.proposal.voting_calendar()} icon={CalendarCheckIcon}>
        <Flex gap={2} alignItems={"start"} flexDirection={"column"}>
          <DateDetails date={proposal.startDate} label={LL.start()} />
          <DateDetails date={proposal.endDate} label={LL.end()} />
        </Flex>
      </DetailsCardsItem>
      <DetailsCardsItem title={LL.proposal.who_can_vote()} icon={UsersIcon}>
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
            <Icon as={ArrowLinkIcon} width={4} height={4} />
          </Link>
        </Flex>
      </DetailsCardsItem>
    </Grid>
  );
};

type DetailsCardsItemProps = PropsWithChildren<{
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  title: string;
}>;

const DetailsCardsItem = ({ icon, title, children }: DetailsCardsItemProps) => {
  return (
    <Flex
      flexDirection={"column"}
      padding={{ base: 6, md: 10 }}
      gap={6}
      alignItems={"start"}
      borderRadius={16}
      bg={"gray.50"}>
      <Heading
        fontSize={{ base: 16, md: 20 }}
        fontWeight={600}
        color="primary.700"
        display={"flex"}
        gap={4}
        alignItems={"center"}>
        <Icon as={icon} boxSize={{ base: 5, md: 6 }} color="primary.700" />
        {title}
      </Heading>
      {children}
    </Flex>
  );
};

const DateDetails = ({ date, label }: { date?: Date; label: string }) => {
  const { formattedProposalDate } = useFormatDate();
  return (
    <Flex
      gap={{ base: 1, md: 3 }}
      alignItems={{ base: "start", md: "center" }}
      flexDirection={{ base: "column", md: "row" }}>
      <Text minW={10} color="gray.500" fontSize={{ base: 14, md: 16 }}>
        {label}
      </Text>
      <Text color="gray.600" fontWeight={500} fontSize={{ base: 14, md: 16 }}>
        {formattedProposalDate(date)}
      </Text>
    </Flex>
  );
};
