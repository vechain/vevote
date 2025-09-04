import { VStack, HStack, Text } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useFormatTime } from "@/hooks/useFormatTime";
import { VeVoteInfo } from "../../../services";
import { AdminCard } from "../../common/AdminCard";
import { FixedPointNumber, Units } from "@vechain/sdk-core";

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
      value: `${veVoteInfo.minVotingDelay} (${formatTime(veVoteInfo.minVotingDelay * 10)})`,
    },
    {
      label: LL.admin.vevote_contract.min_voting_duration(),
      value: `${veVoteInfo.minVotingDuration} (${formatTime(veVoteInfo.minVotingDuration * 10)})`,
    },
    {
      label: LL.admin.vevote_contract.max_voting_duration(),
      value: `${veVoteInfo.maxVotingDuration} (${formatTime(veVoteInfo.maxVotingDuration * 10)})`,
    },
    {
      label: LL.admin.vevote_contract.min_staked_amount(),
      value: LL.admin.vet_format({ amount: Units.formatEther(FixedPointNumber.of(veVoteInfo.minStakedAmount)) }),
    },
  ];

  return (
    <AdminCard title={LL.admin.vevote_contract.contract_info_title()}>
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
    </AdminCard>
  );
}
