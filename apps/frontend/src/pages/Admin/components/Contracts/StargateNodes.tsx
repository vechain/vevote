import { CopyLink } from "@/components/ui/CopyLink";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { useI18nContext } from "@/i18n/i18n-react";
import { formatAddress } from "@/utils/address";
import { Box, Heading, HStack, Spinner, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { getConfig } from "@repo/config";
import { useMemo } from "react";
import { useStargateStats } from "../../hooks";
import { useContractAddresses } from "../../hooks/useContractAddresses";
import { StargateContractInfo } from "./components/StargateContractInfo";
import { StargateLevelDetails } from "./components/StargateLevelDetails";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export function StargateNodes() {
  const { LL } = useI18nContext();
  const { data: stargateStats, isLoading, error } = useStargateStats();
  const { contractAddresses } = useContractAddresses();

  const stargateNFTContractAddress = useMemo(
    () => contractAddresses?.stargateAddress,
    [contractAddresses?.stargateAddress],
  );

  const stackSpacing = useBreakpointValue({
    base: 4,
    md: 6,
  });

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="lg" />
        <Heading size="md">{LL.admin.stargate_nodes.loading()}</Heading>
      </VStack>
    );
  }

  if (error || !stargateStats) {
    return (
      <GenericInfoBox variant="error">
        <Text color={"red.700"}>{LL.admin.stargate_nodes.no_data()}</Text>
      </GenericInfoBox>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2} color={"primary.900"}>
            {LL.admin.stargate_nodes.title()}
          </Heading>
          {stargateNFTContractAddress && (
            <HStack>
              <Text>{LL.admin.vevote_contract.contract_address()}</Text>
              <CopyLink
                href={`${EXPLORER_URL}/accounts/${stargateNFTContractAddress}`}
                isExternal
                textToCopy={stargateNFTContractAddress}
                color={"primary.700"}
                fontWeight={500}>
                {formatAddress(stargateNFTContractAddress)}
              </CopyLink>
            </HStack>
          )}
        </Box>

        <HStack spacing={stackSpacing} align="flex-start" wrap="wrap">
          <StargateContractInfo totalSupply={stargateStats.totalSupply} levelIds={stargateStats.levelIds} />
        </HStack>

        <StargateLevelDetails levels={stargateStats.levels} levelIds={stargateStats.levelIds} />
      </VStack>
    </Box>
  );
}
