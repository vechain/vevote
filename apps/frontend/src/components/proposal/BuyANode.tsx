import { useNodes } from "@/hooks/useUserQueries";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo } from "react";
import { useProposal } from "./ProposalProvider";

export const BuyANode = () => {
  const { connection } = useWallet();
  const { LL } = useI18nContext();
  const { proposal } = useProposal();

  const { nodes } = useNodes({ startDate: proposal?.startDate });
  const isVoter = useMemo(() => nodes.length > 0, [nodes.length]);

  const connectedAndVoter = useMemo(() => {
    return connection.isConnected && isVoter;
  }, [connection.isConnected, isVoter]);

  const infoText = useMemo(() => {
    if (connectedAndVoter) return LL.proposal.buy_another_node();
    return LL.proposal.buy_a_node();
  }, [LL.proposal, connectedAndVoter]);

  //todo: implement buy a node
  const onBuyNode = useCallback(() => {
    console.log("Buy A Node");
  }, []);

  return (
    <Flex
      padding={6}
      gap={4}
      alignItems={"center"}
      width={"full"}
      borderRadius={12}
      borderWidth={1}
      background={connectedAndVoter ? "gray.100" : "primary.50"}
      borderColor={connectedAndVoter ? "gray.200" : "primary.100"}>
      <Icon as={CircleInfoIcon} color={connectedAndVoter ? "gray.600" : "primary.700"} />
      <Text flex={1} fontSize={18} fontWeight={500} color={connectedAndVoter ? "gray.600" : "primary.700"}>
        {infoText}
      </Text>
      <Button onClick={onBuyNode} variant={connectedAndVoter ? "secondary" : "primary"}>
        {LL.buy_a_node()}
      </Button>
    </Flex>
  );
};
