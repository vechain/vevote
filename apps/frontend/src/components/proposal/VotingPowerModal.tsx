import { Button, Flex, Icon, Link, ModalBody, ModalHeader, Text, useDisclosure } from "@chakra-ui/react";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { CopyLink } from "../ui/CopyLink";
import { useWallet } from "@vechain/vechain-kit";
import { formatAddress } from "@/utils/address";
import { useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { ArrowLinkIcon, VotingPowerIcon } from "@/icons";
import { NodeItem } from "@/types/user";
import { getConfig } from "@repo/config";
import { useNodes } from "@/hooks/useUserQueries";
import { useProposal } from "./ProposalProvider";
import { useGetDatesBlocks } from "@/hooks/useGetDatesBlocks";

const VECHAIN_EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const VotingPowerModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { formattedProposalDate } = useFormatDate();
  const { proposal } = useProposal();
  const { nodes } = useNodes({ startDate: proposal.startDate });

  const { startBlock, startBlockId } = useGetDatesBlocks({
    startDate: proposal.startDate,
  });

  const nodesList = useMemo(
    () =>
      nodes.map(node => ({
        multiplier: Number(node.multiplier) / 100,
        nodeName: LL.node_names[node.nodeName](),
        votingPower: Number(node.votingPower) / 100,
      })),
    [LL.node_names, nodes],
  );

  const totalVotingPower = useMemo(() => {
    return nodesList.reduce((acc, node) => acc + node.votingPower, 0);
  }, [nodesList]);

  const block = useMemo(
    () => ({
      id: startBlockId,
      number: startBlock || 0,
    }),
    [startBlock, startBlockId],
  );

  const snapshot = useMemo(
    () => formattedProposalDate(proposal.startDate) || "",
    [formattedProposalDate, proposal.startDate],
  );

  return (
    <>
      <Button
        onClick={onOpen}
        variant={"secondary"}
        leftIcon={<Icon as={VotingPowerIcon} boxSize={5} />}
        size={{ base: "sm", md: "md" }}>
        {totalVotingPower}
      </Button>
      <ModalSkeleton isOpen={isOpen} onClose={onClose}>
        <ModalHeader>
          <ModalTitle title={LL.your_voting_power()} icon={VotingPowerIcon} />
        </ModalHeader>
        <ModalBody>
          <Flex flexDirection={"column"} gap={8}>
            <VotingWallet />

            <Flex flexDirection={"column"} gap={3}>
              <Flex padding={6} borderRadius={12} background={"gray.50"} flexDirection={"column"} gap={2}>
                <NodesHeader />
                <NodesList nodesList={nodesList} />
                <NodesFooter totalVotingPower={totalVotingPower} />
              </Flex>
              <Flex
                fontSize={{ base: 12, md: 14 }}
                padding={4}
                borderRadius={12}
                background={"primary.100"}
                flexDirection={"column"}
                gap={3}>
                <Text color={"gray.600"}>{LL.proposal.voting_power.calculation({ snapshot })}</Text>
                <Text color={"gray.600"} fontWeight={500} display={"flex"} gap={2} alignItems={"center"}>
                  {LL.block()}
                  <Link
                    display={"flex"}
                    gap={2}
                    alignItems={"center"}
                    color={"primary.500"}
                    fontWeight={500}
                    isExternal
                    href={`${VECHAIN_EXPLORER_URL}/blocks/${block.id}`}>
                    {block.number}
                    <Icon as={ArrowLinkIcon} boxSize={4} />
                  </Link>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalSkeleton>
    </>
  );
};

const VotingWallet = () => {
  const { account } = useWallet();
  const { LL } = useI18nContext();

  return (
    <Text display={"inline-flex"} alignItems={"center"} gap={2} color={"gray.600"}>
      {`${LL.wallet()}:`}
      <CopyLink isExternal textToCopy={account?.address} color={"primary.700"} fontWeight={500}>
        {formatAddress(account?.address || "")}
      </CopyLink>
    </Text>
  );
};

const NodesHeader = () => {
  const { LL } = useI18nContext();
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      fontSize={{ base: 12, md: 14 }}
      fontWeight={600}
      color={"gray.500"}>
      <Text>{LL.node()}</Text>
      <Text>{LL.proposal.voting_power.title()}</Text>
    </Flex>
  );
};

const NodesList = ({ nodesList }: { nodesList: NodeItem[] }) => {
  return (
    <Flex flexDirection={"column"} borderBottomWidth={1} borderColor={"gray.200"}>
      {nodesList.map(({ multiplier, nodeName, votingPower }, index) => (
        <Flex
          key={index}
          alignItems={"center"}
          color={"gray.600"}
          paddingY={1.5}
          gap={8}
          fontSize={{ base: 14, md: 16 }}>
          <Text minWidth={"30px"}>{`${multiplier}x`}</Text>
          <Text flex={1}>{nodeName}</Text>
          <Text>{votingPower}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

const NodesFooter = ({ totalVotingPower }: { totalVotingPower: number }) => {
  const { LL } = useI18nContext();
  return (
    <Flex
      paddingY={1.5}
      color={"gray.600"}
      gap={8}
      fontWeight={600}
      alignItems={"center"}
      justifyContent={"space-between"}
      fontSize={{ base: 14, md: 16 }}>
      <Text>{LL.proposal.voting_power.total_voting_power()}</Text>
      <Text>{totalVotingPower}</Text>
    </Flex>
  );
};
