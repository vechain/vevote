import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo } from "react";

//todo: get from user provider
const isVoter = false;

export const BuyANode = () => {
  const { account } = useWallet();
  const { LL } = useI18nContext();

  const connectedAndVoter = useMemo(() => {
    return account?.address && isVoter;
  }, [account?.address]);

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
