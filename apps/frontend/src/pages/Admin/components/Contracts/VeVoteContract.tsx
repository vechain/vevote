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

dayjs.extend(duration);

export function VeVoteContract() {
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="lg" />
        <Heading size="md">Loading VeVote Contract Information...</Heading>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading VeVote contract data: {error instanceof Error ? error.message : "Unknown error"}
      </Alert>
    );
  }

  if (!veVoteInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        No VeVote contract data available
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={6}>
        VeVote Contract Information
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Stat>
          <StatLabel>Contract Version</StatLabel>
          <StatNumber>{veVoteInfo.version.toString()}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Quorum Numerator</StatLabel>
          <StatNumber>{veVoteInfo.quorumNumerator.toString()}</StatNumber>
          <StatHelpText>
            {(Number(veVoteInfo.quorumNumerator) / Number(veVoteInfo.quorumDenominator)) * 100}% required
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Quorum Denominator</StatLabel>
          <StatNumber>{veVoteInfo.quorumDenominator.toString()}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Min Voting Delay</StatLabel>
          <StatNumber>{veVoteInfo.minVotingDelay}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Min Voting Duration</StatLabel>
          <StatNumber>{veVoteInfo.minVotingDuration}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Max Voting Duration</StatLabel>
          <StatNumber>{dayjs.duration(veVoteInfo.maxVotingDuration, "seconds").asDays()}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
}
