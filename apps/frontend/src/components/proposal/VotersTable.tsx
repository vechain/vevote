import { createColumnHelper } from "@tanstack/react-table";
import { VoteItem } from "./VotersModal";
import { Link, Text } from "@chakra-ui/react";
import { formatAddress } from "@/utils/address";
import { CopyLink } from "../ui/CopyLink";
import { MdOutlineArrowOutward } from "react-icons/md";
import dayjs from "dayjs";

const VECHAIN_EXPLORER_URL = "https://explore-testnet.vechain.org"; //todo: add env variable

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

const VotedOptionCell = ({ value }: { value: string }) => {
  return (
    <Text fontWeight={500} color={"primary.500"} fontSize={12}>
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
      <MdOutlineArrowOutward />
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
