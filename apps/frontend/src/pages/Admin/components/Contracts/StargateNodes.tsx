import { Box, Heading, Spinner, Alert, AlertIcon, VStack, Text, HStack, useBreakpointValue } from "@chakra-ui/react";
import { useStargateStats } from "../../hooks";
import { useI18nContext } from "@/i18n/i18n-react";
import { getConfig } from "@repo/config";
import { CopyLink } from "@/components/ui/CopyLink";
import { formatAddress } from "@/utils/address";
import { StargateContractInfo } from "./components/StargateContractInfo";
import { StargateLevelDetails } from "./components/StargateLevelDetails";
import { useContractAddresses } from "../../hooks/useContractAddresses";
import { useMemo } from "react";

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

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {LL.admin.stargate_nodes.error({ error: error instanceof Error ? error.message : LL.admin.unknown_error() })}
      </Alert>
    );
  }

  if (!stargateStats) {
    return (
      <Alert status="warning">
        <AlertIcon />
        {LL.admin.stargate_nodes.no_data()}
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
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

        <StargateLevelDetails
          levels={stargateStats.levels}
          levelIds={stargateStats.levelIds}
          supplies={stargateStats.supplies}
        />
      </VStack>
    </Box>
  );
}
