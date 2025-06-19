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

  const { formattedProposalDate } = useFormatDate();
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={6} width={"100%"}>
      <DetailsCardsItem title={LL.proposal.proposed_by()} icon={EditBoxIcon}>
        <Flex gap={2} alignItems={"start"} flexDirection={"column"}>
          <Flex gap={2} alignItems={"center"}>
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
          <Flex gap={3} alignItems={"center"}>
            <Text color="gray.500">{LL.on()}</Text>
            <Text color="gray.600" fontWeight={500}>
              {formattedProposalDate(proposal.createdAt)}
            </Text>
          </Flex>
        </Flex>
      </DetailsCardsItem>
      <DetailsCardsItem title={LL.proposal.voting_calendar()} icon={CalendarCheckIcon}>
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
    <Flex flexDirection={"column"} padding={10} gap={6} alignItems={"start"} borderRadius={16} bg={"gray.50"}>
      <Heading fontSize={20} fontWeight={600} color="primary.700" display={"flex"} gap={4} alignItems={"center"}>
        <Icon as={icon} boxSize={6} color="primary.700" />
        {title}
      </Heading>
      {children}
    </Flex>
  );
};
