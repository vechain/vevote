import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
} from "@chakra-ui/react";
import { useVeVoteInfo } from "../../hooks";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useI18nContext } from "@/i18n/i18n-react";

dayjs.extend(duration);

export function VeVoteContract() {
  const { LL } = useI18nContext();
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();

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
      <Heading size="md" mb={6}>
        {LL.admin.vevote_contract.title()}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Stat>
          <StatLabel>{LL.admin.vevote_contract.contract_version()}</StatLabel>
          <StatNumber>{veVoteInfo.version.toString()}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>{LL.admin.vevote_contract.quorum_numerator()}</StatLabel>
          <StatNumber>{veVoteInfo.quorumNumerator.toString()}</StatNumber>
          <StatHelpText>
            {LL.admin.vevote_contract.quorum_percentage({ percentage: (Number(veVoteInfo.quorumNumerator) / Number(veVoteInfo.quorumDenominator)) * 100 })}
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>{LL.admin.vevote_contract.quorum_denominator()}</StatLabel>
          <StatNumber>{veVoteInfo.quorumDenominator.toString()}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>{LL.admin.vevote_contract.min_voting_delay()}</StatLabel>
          <StatNumber>{LL.admin.format_minutes_seconds({ minutes: Math.floor(veVoteInfo.minVotingDelay / 60), seconds: veVoteInfo.minVotingDelay })}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>{LL.admin.vevote_contract.min_voting_duration()}</StatLabel>
          <StatNumber>{LL.admin.format_minutes_seconds({ minutes: Math.floor(veVoteInfo.minVotingDuration / 60), seconds: veVoteInfo.minVotingDuration })}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>{LL.admin.vevote_contract.max_voting_duration()}</StatLabel>
          <StatNumber>{LL.admin.format_days({ number: Math.round(dayjs.duration(veVoteInfo.maxVotingDuration, "seconds").asDays()) })}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
}
