import { CopyLink } from "@/components/ui/CopyLink";
import { useFormatTime } from "@/hooks/useFormatTime";
import { useI18nContext } from "@/i18n/i18n-react";
import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import { getConfig } from "@repo/config";
import { useVeVoteInfo } from "../../hooks";
import { formatAddress } from "@/utils/address";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;

export function VeVoteContract() {
  const { LL } = useI18nContext();
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();
  const { formatTime } = useFormatTime();

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
        {LL.admin.vevote_contract.error({ error: error instanceof Error ? error.message : "Unknown error" })}
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
          <Heading size="md" mb={2}>
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

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Stat>
            <StatLabel>{LL.admin.vevote_contract.contract_version()}</StatLabel>
            <StatNumber>{veVoteInfo.version.toString()}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>{LL.admin.vevote_contract.quorum_numerator()}</StatLabel>
            <StatNumber>{veVoteInfo.quorumNumerator.toString()}</StatNumber>
            <StatHelpText>
              {LL.admin.vevote_contract.quorum_percentage({
                percentage: (Number(veVoteInfo.quorumNumerator) / Number(veVoteInfo.quorumDenominator)) * 100,
              })}
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>{LL.admin.vevote_contract.quorum_denominator()}</StatLabel>
            <StatNumber>{veVoteInfo.quorumDenominator.toString()}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>{LL.admin.vevote_contract.min_voting_delay()}</StatLabel>
            <StatNumber>{formatTime(veVoteInfo.minVotingDelay)}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>{LL.admin.vevote_contract.min_voting_duration()}</StatLabel>
            <StatNumber>{formatTime(veVoteInfo.minVotingDuration)}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>{LL.admin.vevote_contract.max_voting_duration()}</StatLabel>
            <StatNumber>{formatTime(veVoteInfo.maxVotingDuration)}</StatNumber>
          </Stat>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
