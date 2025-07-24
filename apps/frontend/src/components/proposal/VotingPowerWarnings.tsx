import { Button, Flex, Icon, Link, Text } from "@chakra-ui/react";
import { GenericInfoBox } from "../ui/GenericInfoBox";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowLinkIcon } from "@/icons";
import { stargateUrl } from "@/utils/stargate";

export const VotingPowerLegacyNodeWarning = () => {
  const { LL } = useI18nContext();
  return (
    <GenericInfoBox variant="warning">
      <Flex alignItems={"center"}>
        <Text color={"orange.700"} fontSize={12} fontWeight={500}>
          {LL.proposal.voting_power.warnings.legacy_node()}
        </Text>
        <Button
          as={Link}
          isExternal
          flexShrink={0}
          variant={"tertiary"}
          href={stargateUrl}
          size="sm"
          rightIcon={<Icon as={ArrowLinkIcon} boxSize={4} />}>
          {"Migrate"}
        </Button>
      </Flex>
    </GenericInfoBox>
  );
};

export const VotingPowerDelegatedWarning = () => {
  const { LL } = useI18nContext();
  return (
    <GenericInfoBox variant="warning">
      <Text color={"orange.700"} fontSize={12} fontWeight={500}>
        {LL.proposal.voting_power.warnings.delegated.title()}
      </Text>
      <Text color={"gray.600"} fontSize={12}>
        {LL.proposal.voting_power.warnings.delegated.description()}
      </Text>
    </GenericInfoBox>
  );
};
