import { Box, VStack, HStack, Text, Heading } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useFormatTime } from "@/hooks/useFormatTime";
import { VeVoteInfo } from "../../../services";

interface VevoteContractInfoProps {
  veVoteInfo: VeVoteInfo;
}

export function VevoteContractInfo({ veVoteInfo }: VevoteContractInfoProps) {
  const { LL } = useI18nContext();
  const { formatTime } = useFormatTime();

  const contractData = [
    {
      label: LL.admin.vevote_contract.contract_version(),
      value: veVoteInfo.version.toString(),
    },
    {
      label: LL.admin.vevote_contract.quorum_numerator(),
      value: `${veVoteInfo.quorumNumerator.toString()} (${((Number(veVoteInfo.quorumNumerator) / Number(veVoteInfo.quorumDenominator)) * 100).toFixed(1)}%)`,
    },
    {
      label: LL.admin.vevote_contract.quorum_denominator(),
      value: veVoteInfo.quorumDenominator.toString(),
    },
    {
      label: LL.admin.vevote_contract.min_voting_delay(),
      value: formatTime(veVoteInfo.minVotingDelay),
    },
    {
      label: LL.admin.vevote_contract.min_voting_duration(),
      value: formatTime(veVoteInfo.minVotingDuration),
    },
    {
      label: LL.admin.vevote_contract.max_voting_duration(),
      value: formatTime(veVoteInfo.maxVotingDuration),
    },
  ];

  return (
    <Box border="1px" borderColor="gray.200" borderRadius="md" p={4} w={"fit-content"} minW={300}>
      <Heading size="sm" mb={3}>
        Contract Information
      </Heading>
      <VStack spacing={2} align="stretch">
        {contractData.map(({ label, value }) => (
          <HStack key={label} justify="space-between" align="center">
            <Text fontSize="sm" fontWeight="medium">
              {label}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {value}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
