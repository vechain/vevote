import { CopyLink } from "@/components/ui/CopyLink";
import { useI18nContext } from "@/i18n/i18n-react";
import { formatAddress } from "@/utils/address";
import { Alert, AlertIcon, Box, Heading, HStack, Spinner, Text, VStack, useBreakpointValue } from "@chakra-ui/react";
import { getConfig } from "@repo/config";
import { useVeVoteInfo } from "../../hooks";
import { UserRoleChecker } from "../common/UserRoleChecker";
import { VevoteContractInfo } from "./components/VevoteContractInfo";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;

export function VeVoteContract() {
  const { LL } = useI18nContext();
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();

  const stackSpacing = useBreakpointValue({
    base: 4,
    md: 6,
  });

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="lg" />
        <Heading size="md">{LL.admin.vevote_contract.loading()}</Heading>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {LL.admin.vevote_contract.error({ error: error instanceof Error ? error.message : LL.admin.unknown_error() })}
      </Alert>
    );
  }

  if (!veVoteInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        {LL.admin.vevote_contract.no_data()}
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2} color={"primary.900"}>
            {LL.admin.vevote_contract.title()}
          </Heading>
          <HStack>
            <Text>{LL.admin.vevote_contract.contract_address()}</Text>
            <CopyLink
              href={`${EXPLORER_URL}/accounts/${contractAddress}`}
              isExternal
              textToCopy={contractAddress}
              color={"primary.700"}
              fontWeight={500}>
              {formatAddress(contractAddress)}
            </CopyLink>
          </HStack>
        </Box>

        <HStack spacing={stackSpacing} align="flex-start" wrap="wrap">
          <UserRoleChecker contractType="vevote" />
          <VevoteContractInfo veVoteInfo={veVoteInfo} />
        </HStack>
      </VStack>
    </Box>
  );
}
