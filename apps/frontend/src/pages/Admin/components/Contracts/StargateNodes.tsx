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
  TableContainer
} from "@chakra-ui/react";
import { useStargateStats } from "../../hooks";

export function StargateNodes() {
  const { data: stargateStats, isLoading, error } = useStargateStats();

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="lg" />
        <Heading size="md">Loading Stargate NFT Information...</Heading>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading Stargate NFT data: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  if (!stargateStats) {
    return (
      <Alert status="warning">
        <AlertIcon />
        No Stargate NFT data available
      </Alert>
    );
  }

  const formatVET = (wei: bigint) => {
    const vet = Number(wei) / 1e18;
    return `${vet.toLocaleString()} VET`;
  };

  return (
    <Box>
      <Heading size="md" mb={6}>
        Stargate NFT Contract Information
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Total Supply</StatLabel>
          <StatNumber>{stargateStats.totalSupply.toString()}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Available Levels</StatLabel>
          <StatNumber>{stargateStats.levelIds.length}</StatNumber>
          <StatHelpText>Level IDs: {stargateStats.levelIds.join(", ")}</StatHelpText>
        </Stat>
      </SimpleGrid>

      {stargateStats.levels.length > 0 && (
        <Box mb={8}>
          <Heading size="sm" mb={4}>Level Details</Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Level</Th>
                  <Th>Name</Th>
                  <Th>Is X-Node</Th>
                  <Th>Maturity Blocks</Th>
                  <Th>VET Required</Th>
                  <Th>Circulating</Th>
                  <Th>Cap</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stargateStats.levels.map((level, index) => {
                  const supply = stargateStats.supplies[index];
                  return (
                    <Tr key={index}>
                      <Td>{stargateStats.levelIds[index]}</Td>
                      <Td>{level.name}</Td>
                      <Td>{level.isX ? "Yes" : "No"}</Td>
                      <Td>{level.maturityBlocks.toString()}</Td>
                      <Td>{formatVET(level.vetAmountRequiredToStake)}</Td>
                      <Td>{supply ? supply.circulating.toString() : "N/A"}</Td>
                      <Td>{supply ? supply.cap.toString() : "N/A"}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box>
        <Heading size="sm" mb={4}>Contract Information</Heading>
        <Text fontSize="sm" color="gray.600">
          This displays comprehensive information about the Stargate NFT contract including
          level configurations, supply information, and staking requirements.
        </Text>
      </Box>
    </Box>
  );
}