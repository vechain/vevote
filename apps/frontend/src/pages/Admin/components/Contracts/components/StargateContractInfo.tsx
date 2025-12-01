import { VStack, HStack, Text } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { AdminCard } from "../../common/AdminCard";
import { useMemo } from "react";

interface StargateContractInfoProps {
  totalSupply: bigint;
  levelIds: number[];
}

export function StargateContractInfo({ totalSupply, levelIds }: StargateContractInfoProps) {
  const { LL } = useI18nContext();

  const contractData = useMemo(
    () => [
      {
        label: LL.admin.stargate_nodes.total_supply(),
        value: totalSupply.toString(),
      },
      {
        label: LL.admin.stargate_nodes.available_levels(),
        value: `${levelIds.length} (${levelIds.join(", ")})`,
      },
    ],
    [LL, totalSupply, levelIds],
  );

  return (
    <AdminCard title={LL.admin.stargate_nodes.contract_info_title()}>
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
