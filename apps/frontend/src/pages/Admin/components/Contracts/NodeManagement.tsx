import { Box, Heading, Text, HStack, VStack, useBreakpointValue } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { CopyLink } from "@/components/ui/CopyLink";
import { getConfig } from "@repo/config";
import { formatAddress } from "@/utils/address";
import { UserRoleChecker } from "../common/UserRoleChecker";
import { NodeManagementContractInfo } from "./components/NodeManagementContractInfo";
import { useMemo } from "react";
import { useContractAddresses } from "../../hooks/useContractAddresses";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export function NodeManagement() {
  const { LL } = useI18nContext();

  const { contractAddresses } = useContractAddresses();

  const nodeManagementContractAddress = useMemo(
    () => contractAddresses?.nodeManagementAddress,
    [contractAddresses?.nodeManagementAddress],
  );
  const stackSpacing = useBreakpointValue({
    base: 4,
    md: 6,
  });

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
            {LL.admin.node_management.title()}
          </Heading>
          {nodeManagementContractAddress && (
            <HStack>
              <Text>{LL.admin.vevote_contract.contract_address()}</Text>
              <CopyLink
                href={`${EXPLORER_URL}/accounts/${nodeManagementContractAddress}`}
                isExternal
                textToCopy={nodeManagementContractAddress}
                color={"primary.700"}
                fontWeight={500}>
                {formatAddress(nodeManagementContractAddress)}
              </CopyLink>
            </HStack>
          )}
        </Box>

        <HStack spacing={stackSpacing} align="flex-start" wrap="wrap">
          <UserRoleChecker contractType="nodeManagement" />
          <NodeManagementContractInfo />
        </HStack>
      </VStack>
    </Box>
  );
}
