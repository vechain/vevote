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

const VECHAIN_EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const VotingPowerModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { formattedProposalDate } = useFormatDate();
  const { proposal } = useProposal();
  const { nodes } = useNodes({ startDate: proposal.startDate });

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

  //todo: get block info from blockchain
  const block = useMemo(
    () => ({
      id: "0x0146e719f72cf2ef3e7baaefcb3a96c6d6c9d13111c2610155241ff634c5f80a",
      number: "21.423.897",
    }),
    [],
  );

  //todo: get snapshot date from blockchain
  const snapshot = useMemo(
    () => formattedProposalDate(new Date("2023-10-01T00:00:00Z")) || "",
    [formattedProposalDate],
  );

  return (
    <>
      <Button onClick={onOpen} variant={"secondary"} leftIcon={<Icon as={VotingPowerIcon} width={5} height={5} />}>
        {totalVotingPower}
      </Button>
      <ModalSkeleton isOpen={isOpen} onClose={onClose}>
        <ModalHeader>
          <ModalTitle title={LL.proposal.voting_power.title()} icon={VotingPowerIcon} />
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
              <Flex padding={4} borderRadius={12} background={"primary.100"} flexDirection={"column"} gap={3}>
                <Text fontSize={14} color={"gray.600"}>
                  {LL.proposal.voting_power.calculation({ snapshot })}
                </Text>
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
                    <Icon as={ArrowLinkIcon} width={4} height={4} />
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
      <CopyLink isExternal textToCopy={account?.address} color={"primary.500"} fontWeight={500}>
        {formatAddress(account?.address || "")}
      </CopyLink>
    </Text>
  );
};

const NodesHeader = () => {
  const { LL } = useI18nContext();
  return (
    <Flex alignItems={"center"} justifyContent={"space-between"} fontSize={14} fontWeight={600} color={"gray.500"}>
      <Text>{LL.node()}</Text>
      <Text>{LL.proposal.voting_power.title()}</Text>
    </Flex>
  );
};

const NodesList = ({ nodesList }: { nodesList: NodeItem[] }) => {
  return (
    <Flex flexDirection={"column"} borderBottomWidth={1} borderColor={"gray.200"}>
      {nodesList.map(({ multiplier, nodeName, votingPower }, index) => (
        <Flex key={index} alignItems={"center"} color={"gray.600"} paddingY={1.5} gap={8}>
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
      justifyContent={"space-between"}>
      <Text>{LL.proposal.voting_power.total_voting_power()}</Text>
      <Text>{totalVotingPower}</Text>
    </Flex>
  );
};
