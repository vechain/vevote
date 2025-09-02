import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { StargateLevelSupply } from "@/pages/Admin/services";

interface Level {
  name: string;
  isX: boolean;
  maturityBlocks: bigint;
  vetAmountRequiredToStake: bigint;
}

interface StargateLevelDetailsProps {
  levels: Level[];
  levelIds: number[];
  supplies: StargateLevelSupply[];
}

export function StargateLevelDetails({ levels, levelIds, supplies }: StargateLevelDetailsProps) {
  const { LL } = useI18nContext();

  const formatVET = (wei: bigint) => {
    const vet = Number(wei) / 1e18;
    return LL.admin.stargate_nodes.vet_format({ amount: vet.toLocaleString() });
  };

  if (levels.length === 0) {
    return null;
  }

  return (
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
            {levels.map((level, index) => {
              const supply = supplies[index];
              return (
                <Tr key={index}>
                  <Td>{levelIds[index]}</Td>
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
  );
}
