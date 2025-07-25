import { useAllUserNodes, useIsDelegator, useNodes } from "@/hooks/useUserQueries";
import { useI18nContext } from "@/i18n/i18n-react";
import { VotingPowerIcon } from "@/icons";
import { formatAddress } from "@/utils/address";
import { Button, Flex, Icon, Link, ModalBody, ModalHeader, Text, useDisclosure } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useMemo } from "react";
import { CopyLink } from "../ui/CopyLink";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { VotingPowerModalTable } from "./VotingPowerModalTable";
import {
  VotingPowerDelegatedWarning,
  VotingPowerLegacyNodeWarning,
  VotingPowerZeroWarning,
} from "./VotingPowerWarnings";
import { ResourcesLinks } from "@/types/terms";
import { getConfig } from "@repo/config";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const VotingPowerModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { nodes } = useNodes();
  const { allNodes } = useAllUserNodes();
  const { isDelegator } = useIsDelegator();

  const nodesList = useMemo(
    () =>
      nodes.map(node => ({
        multiplier: Number(node.multiplier) / 100,
        nodeName: LL.node_names[node.nodeName](),
        votingPower: Number(node.votingPower) / 100,
      })),
    [LL.node_names, nodes],
  );

  const totalVotingPower = useMemo(() => nodesList.reduce((acc, node) => acc + node.votingPower, 0), [nodesList]);

  const hasLegacyNodes = useMemo(() => {
    return allNodes.some(node => !node.isStargate);
  }, [allNodes]);

  return (
    <>
      <Button onClick={onOpen} leftIcon={<Icon as={VotingPowerIcon} boxSize={5} />} size={{ base: "md", md: "lg" }}>
        {totalVotingPower || LL.proposal.voting_power.get_voting_power()}
      </Button>
      <ModalSkeleton isOpen={isOpen} onClose={onClose}>
        <ModalHeader>
          <ModalTitle title={LL.your_voting_power()} icon={VotingPowerIcon} />
        </ModalHeader>
        <ModalBody>
          <Flex flexDirection={"column"} gap={8}>
            <VotingWallet />
            {hasLegacyNodes && <VotingPowerLegacyNodeWarning />}
            {isDelegator && <VotingPowerDelegatedWarning />}
            {totalVotingPower > 0 ? (
              <VotingPowerModalTable nodesList={nodesList} totalVotingPower={totalVotingPower} />
            ) : (
              <VotingPowerZeroWarning />
            )}
            <Button
              as={Link}
              isExternal
              href={ResourcesLinks.STARGATE}
              rightIcon={<Icon as={VotingPowerIcon} />}
              size={{ base: "md", md: "lg" }}>
              {LL.proposal.voting_power.get_more_voting_power()}
            </Button>
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
      <CopyLink
        href={`${EXPLORER_URL}/accounts/${account?.address}`}
        isExternal
        textToCopy={account?.address}
        color={"primary.700"}
        fontWeight={500}>
        {formatAddress(account?.address || "")}
      </CopyLink>
    </Text>
  );
};
