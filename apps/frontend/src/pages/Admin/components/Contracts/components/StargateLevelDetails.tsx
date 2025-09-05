import { DataTable } from "@/components/ui/TableSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { TranslationFunctions } from "@/i18n/i18n-types";
import { Box, Heading } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseCell, NumberCell, TableHeader, VETAmountCell } from "../../common/AdminTableCells";

interface Level {
  name: string;
  maturityBlocks: bigint;
  vetAmountRequiredToStake: bigint;
}

interface StargateLevelDetailsProps {
  levels: Level[];
  levelIds: number[];
}

interface StargateLevelRow {
  levelId: number;
  name: string;
  maturityBlocks: bigint;
  vetAmountRequiredToStake: bigint;
}

const columnHelper = createColumnHelper<StargateLevelRow>();

const columns = (LL: TranslationFunctions) => [
  columnHelper.accessor("name", {
    cell: data => <BaseCell value={data.getValue()} textAlign="center" fontWeight="medium" />,
    header: () => <TableHeader label={LL.admin.stargate_nodes.table.name()} />,
    id: "NAME",
    size: 160,
  }),
  columnHelper.accessor("maturityBlocks", {
    cell: data => <NumberCell value={data.getValue()} />,
    header: () => <TableHeader label={LL.admin.stargate_nodes.table.maturity_blocks()} />,
    id: "MATURITY_BLOCKS",
    size: 140,
  }),
  columnHelper.accessor("vetAmountRequiredToStake", {
    cell: data => <VETAmountCell amount={data.getValue()} />,
    header: () => <TableHeader label={LL.admin.stargate_nodes.table.vet_required()} />,
    id: "VET_REQUIRED",
    size: 140,
  }),
];

export function StargateLevelDetails({ levels, levelIds }: StargateLevelDetailsProps) {
  const { LL } = useI18nContext();

  const tableData: StargateLevelRow[] = useMemo(
    () =>
      levels.map((level, index) => ({
        levelId: levelIds[index],
        name: level.name,
        maturityBlocks: level.maturityBlocks,
        vetAmountRequiredToStake: level.vetAmountRequiredToStake,
      })),
    [levels, levelIds],
  );

  if (levels.length === 0) {
    return null;
  }

  return (
    <Box mb={8} overflow={"hidden"}>
      <Heading size="sm" mb={4}>
        {LL.admin.stargate_nodes.level_details_title()}
      </Heading>
      <Box overflow={"auto"} maxW={600}>
        <DataTable columns={columns(LL)} data={tableData} />
      </Box>
    </Box>
  );
}
