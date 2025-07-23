import { createColumnHelper } from "@tanstack/react-table";
import { defineStyle, Icon, Link, Text } from "@chakra-ui/react";
import { formatAddress } from "@/utils/address";
import { CopyLink } from "../ui/CopyLink";
import { DataTable } from "../ui/TableSkeleton";
import dayjs from "dayjs";
import { ArrowLinkIcon } from "@/icons";
import { getConfig } from "@repo/config";
import { SingleChoiceEnum } from "@/types/proposal";

const VECHAIN_EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export type VoteItem = {
  date: Date;
  address: string;
  node: string;
  nodeId: string;
  votingPower: number;
  votedOption: string;
  transactionId: string;
};

const columnHelper = createColumnHelper<VoteItem>();

const TableHeader = ({ label }: { label: string }) => {
  return (
    <Text whiteSpace={"nowrap"} fontSize={12} color={"gray.800"} fontWeight={600}>
      {label}
    </Text>
  );
};

const BaseCell = ({ value }: { value: string }) => {
  return (
    <Text whiteSpace={"nowrap"} fontSize={12} color={"gray.600"}>
      {value}
    </Text>
  );
};

const AddressCell = ({ value }: { value: string }) => {
  return (
    <CopyLink
      isExternal
      textToCopy={value}
      color={"primary.500"}
      fontSize={12}
      fontWeight={500}
      href={`${VECHAIN_EXPLORER_URL}/account/${value}`}>
      {formatAddress(value)}
    </CopyLink>
  );
};

const votedOptionCellVariants = (choice: string) => {
  const style = {
    for: defineStyle({
      background: "green.100",
      color: "green.700",
    }),
    against: defineStyle({
      background: "red.100",
      color: "red.700",
    }),
    default: defineStyle({
      background: "gray.100",
      color: "gray.700",
    }),
  };

  switch (choice) {
    case SingleChoiceEnum.FOR:
      return style.for;
    case SingleChoiceEnum.AGAINST:
      return style.against;
    default:
      return style.default;
  }
};

const VotedOptionCell = ({ option }: { option: string }) => {
  return (
    <Text
      textAlign={"center"}
      fontWeight={500}
      fontSize={12}
      borderRadius={4}
      p={1}
      {...votedOptionCellVariants(option)}>
      {option}
    </Text>
  );
};

const TransactionIdCell = ({ value }: { value: string }) => {
  return (
    <Link
      display={"flex"}
      gap={2}
      alignItems={"center"}
      color={"primary.500"}
      fontWeight={500}
      fontSize={12}
      isExternal
      href={`${VECHAIN_EXPLORER_URL}/transactions/${value}`}>
      {formatAddress(value)}
      <Icon as={ArrowLinkIcon} width={4} height={4} />
    </Link>
  );
};

const votersColumn = [
  columnHelper.accessor("date", {
    cell: data => <BaseCell value={dayjs(data.getValue()).format("DD/MM/YYYY")} />,
    header: () => <TableHeader label="Date" />,
    id: "DATE",
  }),
  columnHelper.accessor("address", {
    cell: data => <AddressCell value={data.getValue()} />,
    header: () => <TableHeader label="Address" />,
    id: "ADDRESS",
  }),
  columnHelper.accessor("node", {
    cell: data => <BaseCell value={data.getValue()} />,
    header: () => <TableHeader label="Node" />,
    id: "NODE",
  }),
  columnHelper.accessor("nodeId", {
    cell: data => <BaseCell value={formatAddress(data.getValue())} />,
    header: () => <TableHeader label="Node ID" />,
    id: "NODE_ID",
  }),
  columnHelper.accessor("votingPower", {
    cell: data => <BaseCell value={data.getValue().toString()} />,
    header: () => <TableHeader label="Voting Power" />,
    id: "VOTING_POWER",
  }),
  columnHelper.accessor("votedOption", {
    cell: data => <VotedOptionCell option={data.getValue()} />,
    header: () => <TableHeader label="Voted Option" />,
    id: "VOTED_OPTION",
  }),
  columnHelper.accessor("transactionId", {
    cell: data => <TransactionIdCell value={data.getValue()} />,
    header: () => <TableHeader label="Transaction ID" />,
    id: "TRANSACTION_ID",
  }),
];

interface VotersTableProps {
  data: VoteItem[];
}

export const VotersTable = ({ data }: VotersTableProps) => {
  return <DataTable columns={votersColumn} data={data} />;
};
