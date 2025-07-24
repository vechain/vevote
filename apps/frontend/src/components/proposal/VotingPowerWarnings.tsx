import { Button, Flex, Icon, Link, Text } from "@chakra-ui/react";
import { GenericInfoBox } from "../ui/GenericInfoBox";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowLinkIcon } from "@/icons";
import { stargateUrl } from "@/utils/stargate";
import { PropsWithChildren } from "react";

export const VotingPowerLegacyNodeWarning = () => {
  const { LL } = useI18nContext();
  return (
    <GenericInfoBox variant="warning">
      <Flex
        alignItems={{ base: "start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        gap={4}
        width={"full"}>
        <Text color={"orange.700"} fontSize={12} fontWeight={500}>
          {LL.proposal.voting_power.warnings.legacy_node()}
        </Text>
        <WarningButton href={stargateUrl}>{LL.migrate()}</WarningButton>
      </Flex>
    </GenericInfoBox>
  );
};

export const VotingPowerDelegatedWarning = () => {
  const { LL } = useI18nContext();
  return (
    <GenericInfoBox variant="warning">
      <Flex
        alignItems={{ base: "start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        gap={4}
        width={"full"}>
        <Text color={"orange.700"} fontSize={12} fontWeight={500}>
          {LL.proposal.voting_power.warnings.delegated.title()}
        </Text>
        <WarningButton href={stargateUrl}>{LL.stargate()}</WarningButton>
      </Flex>
    </GenericInfoBox>
  );
};

const WarningButton = ({ href, children }: PropsWithChildren<{ href: string }>) => {
  return (
    <Button
      as={Link}
      marginLeft={{ base: 0, md: "auto" }}
      isExternal
      flexShrink={0}
      variant={"tertiary"}
      href={href}
      size="sm"
      rightIcon={<Icon as={ArrowLinkIcon} boxSize={4} />}>
      {children}
    </Button>
  );
};
