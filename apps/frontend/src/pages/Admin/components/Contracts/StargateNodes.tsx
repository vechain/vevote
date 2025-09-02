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
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
} from "@chakra-ui/react";
import { useStargateStats } from "../../hooks";
import { useI18nContext } from "@/i18n/i18n-react";
import { getConfig } from "@repo/config";
import { CopyLink } from "@/components/ui/CopyLink";
import { formatAddress } from "@/utils/address";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;
const stargateNFTContractAddress = getConfig(import.meta.env.VITE_APP_ENV).stargateNFTContractAddress;

export function StargateNodes() {
  const { LL } = useI18nContext();
  const { data: stargateStats, isLoading, error } = useStargateStats();

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
        {LL.admin.stargate_nodes.error({ error: error instanceof Error ? error.message : "Unknown error" })}
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

  const formatVET = (wei: bigint) => {
    const vet = Number(wei) / 1e18;
    return LL.admin.stargate_nodes.vet_format({ amount: vet.toLocaleString() });
  };

  return (
    <Box>
      <Heading size="md" mb={2}>
        {LL.admin.stargate_nodes.title()}
      </Heading>

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

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} py={8}>
        <Stat>
          <StatLabel>{LL.admin.stargate_nodes.total_supply()}</StatLabel>
          <StatNumber>{stargateStats.totalSupply.toString()}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>{LL.admin.stargate_nodes.available_levels()}</StatLabel>
          <StatNumber>{stargateStats.levelIds.length}</StatNumber>
          <StatHelpText>{LL.admin.stargate_nodes.level_ids({ ids: stargateStats.levelIds.join(", ") })}</StatHelpText>
        </Stat>
      </SimpleGrid>

      {stargateStats.levels.length > 0 && (
        <Box mb={8}>
          <Heading size="sm" mb={4}>
            {LL.admin.stargate_nodes.level_details_title()}
          </Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>{LL.admin.stargate_nodes.table.level()}</Th>
                  <Th>{LL.admin.stargate_nodes.table.name()}</Th>
                  <Th>{LL.admin.stargate_nodes.table.is_x_node()}</Th>
                  <Th>{LL.admin.stargate_nodes.table.maturity_blocks()}</Th>
                  <Th>{LL.admin.stargate_nodes.table.vet_required()}</Th>
                  <Th>{LL.admin.stargate_nodes.table.circulating()}</Th>
                  <Th>{LL.admin.stargate_nodes.table.cap()}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stargateStats.levels.map((level, index) => {
                  const supply = stargateStats.supplies[index];
                  return (
                    <Tr key={index}>
                      <Td>{stargateStats.levelIds[index]}</Td>
                      <Td>{level.name}</Td>
                      <Td>{level.isX ? LL.admin.stargate_nodes.yes() : LL.admin.stargate_nodes.no()}</Td>
                      <Td>{level.maturityBlocks.toString()}</Td>
                      <Td>{formatVET(level.vetAmountRequiredToStake)}</Td>
                      <Td>{supply ? supply.circulating.toString() : LL.admin.stargate_nodes.not_available()}</Td>
                      <Td>{supply ? supply.cap.toString() : LL.admin.stargate_nodes.not_available()}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box>
        <Heading size="sm" mb={4}>
          {LL.admin.stargate_nodes.contract_info_title()}
        </Heading>
        <Text fontSize="sm" color="gray.600">
          {LL.admin.stargate_nodes.contract_description()}
        </Text>
      </Box>
    </Box>
  );
}
