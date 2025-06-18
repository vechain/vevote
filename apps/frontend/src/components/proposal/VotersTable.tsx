import { createColumnHelper } from "@tanstack/react-table";
import { VoteItem } from "./VotersModal";
import { defineStyle, Icon, Link, Text } from "@chakra-ui/react";
import { formatAddress } from "@/utils/address";
import { CopyLink } from "../ui/CopyLink";
import dayjs from "dayjs";
import { useMemo } from "react";
import { ArrowLinkIcon } from "@/icons";
import { getConfig } from "@repo/config";

const VECHAIN_EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

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

const votedOptionCellVariants = {
  yes: defineStyle({
    background: "green.100",
    color: "green.700",
  }),
  no: defineStyle({
    background: "red.100",
    color: "red.700",
  }),
  default: defineStyle({
    background: "gray.100",
    color: "gray.700",
  }),
};

const VotedOptionCell = ({ value }: { value: string }) => {
  const variant = useMemo(() => {
    if (value === "Yes") return votedOptionCellVariants.yes;
    if (value === "No") return votedOptionCellVariants.no;
    return votedOptionCellVariants.default;
  }, [value]);
  return (
    <Text {...variant} textAlign={"center"} fontWeight={500} fontSize={12} borderRadius={4} p={1}>
      {value}
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

export const votersColumn = [
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
    cell: data => <BaseCell value={data.getValue()} />,
    header: () => <TableHeader label="Node ID" />,
    id: "NODE_ID",
  }),
  columnHelper.accessor("votingPower", {
    cell: data => <BaseCell value={data.getValue().toString()} />,
    header: () => <TableHeader label="Voting Power" />,
    id: "VOTING_POWER",
  }),
  columnHelper.accessor("votedOption", {
    cell: data => <VotedOptionCell value={data.getValue()} />,
    header: () => <TableHeader label="Voted Option" />,
    id: "VOTED_OPTION",
  }),
  columnHelper.accessor("transactionId", {
    cell: data => <TransactionIdCell value={data.getValue()} />,
    header: () => <TableHeader label="Transaction ID" />,
    id: "TRANSACTION_ID",
  }),
];
