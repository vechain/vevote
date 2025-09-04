import { Box, Heading } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { StargateLevelSupply } from "@/pages/Admin/services";
import { DataTable } from "@/components/ui/TableSkeleton";
import { createColumnHelper } from "@tanstack/react-table";
import { TableHeader, BaseCell, VETAmountCell, BooleanCell, NumberCell } from "../../common/AdminTableCells";

interface Level {
  name: string;
  isX: boolean;
  maturityBlocks: bigint;
  vetAmountRequiredToStake: bigint;
}

interface StargateLevelDetailsProps {
  readonly levels: readonly Level[];
  readonly levelIds: readonly number[];
  readonly supplies: readonly StargateLevelSupply[];
}

interface StargateLevelRow {
  levelId: number;
  name: string;
  isX: boolean;
  maturityBlocks: bigint;
  vetAmountRequiredToStake: bigint;
  circulating: bigint | null;
  cap: number | null;
}

const columnHelper = createColumnHelper<StargateLevelRow>();

export function StargateLevelDetails({ levels, levelIds, supplies }: StargateLevelDetailsProps) {
  const { LL } = useI18nContext();

  if (levels.length === 0) {
    return null;
  }

  const tableData: StargateLevelRow[] = levels.map((level, index) => ({
    levelId: levelIds[index],
    name: level.name,
    isX: level.isX,
    maturityBlocks: level.maturityBlocks,
    vetAmountRequiredToStake: level.vetAmountRequiredToStake,
    circulating: supplies[index]?.circulating ?? null,
    cap: supplies[index]?.cap ?? null,
  }));

  const columns = [
    columnHelper.accessor("levelId", {
      cell: data => <BaseCell value={data.getValue().toString()} fontWeight="bold" />,
      header: () => <TableHeader label={LL.admin.stargate_nodes.table.level()} />,
      id: "LEVEL",
      size: 80,
    }),
    columnHelper.accessor("name", {
      cell: data => <BaseCell value={data.getValue()} textAlign="left" fontWeight="medium" />,
      header: () => <TableHeader label={LL.admin.stargate_nodes.table.name()} />,
      id: "NAME",
      size: 160,
    }),
    columnHelper.accessor("isX", {
      cell: data => <BooleanCell value={data.getValue()} />,
      header: () => <TableHeader label={LL.admin.stargate_nodes.table.is_x_node()} />,
      id: "IS_X_NODE",
      size: 100,
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
    columnHelper.accessor("circulating", {
      cell: data => {
        const value = data.getValue();
        return (
          <BaseCell
            value={value !== null ? value.toString() : LL.admin.stargate_nodes.not_available()}
            color={value !== null ? "gray.600" : "gray.400"}
            fontStyle={value !== null ? "normal" : "italic"}
          />
        );
      },
      header: () => <TableHeader label={LL.admin.stargate_nodes.table.circulating()} />,
      id: "CIRCULATING",
      size: 120,
    }),
    columnHelper.accessor("cap", {
      cell: data => {
        const value = data.getValue();
        return (
          <BaseCell
            value={value !== null ? value.toString() : LL.admin.stargate_nodes.not_available()}
            color={value !== null ? "gray.600" : "gray.400"}
            fontStyle={value !== null ? "normal" : "italic"}
          />
        );
      },
      header: () => <TableHeader label={LL.admin.stargate_nodes.table.cap()} />,
      id: "CAP",
      size: 120,
    }),
  ];

  return (
    <Box mb={8} overflow={"hidden"}>
      <Heading size="sm" mb={4}>
        {LL.admin.stargate_nodes.level_details_title()}
      </Heading>
      <Box overflow={"auto"}>
        <DataTable columns={columns} data={tableData} />
      </Box>
    </Box>
  );
}
