import { createColumnHelper } from "@tanstack/react-table";
import { defineStyle, Icon, Link, Text, TextProps } from "@chakra-ui/react";
import { formatAddress } from "@/utils/address";
import { CopyLink } from "@/components/ui/CopyLink";
import { DataTable } from "@/components/ui/TableSkeleton";
import dayjs from "dayjs";
import { ArrowLinkIcon } from "@/icons";
import { getConfig } from "@repo/config";
import { SingleChoiceEnum } from "@/types/proposal";
import { useI18nContext } from "@/i18n/i18n-react";

const VECHAIN_EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export type VoteItem = {
  date: Date;
  voter: {
    address: string;
    domain?: string;
  };
  node: string;
  nodeId: string;
  votingPower: number;
  votedOption: string;
  transactionId: string;
};

const columnHelper = createColumnHelper<VoteItem>();

const TableHeader = ({ label }: { label: string }) => {
  return (
    <Text
      whiteSpace={"nowrap"}
      fontSize={12}
      color={"gray.800"}
      fontWeight={500}
      textTransform={"none"}
      flex={1}
      textAlign={"center"}>
      {label}
    </Text>
  );
};

const BaseCell = ({ value, ...restProps }: TextProps & { value: string }) => {
  return (
    <Text whiteSpace={"nowrap"} fontSize={12} color={"gray.600"} textAlign={"center"} {...restProps}>
      {value}
    </Text>
  );
};

const AddressCell = ({ voter }: { voter: VoteItem["voter"] }) => {
  return (
    <CopyLink
      isExternal
      textToCopy={voter?.address}
      color={"primary.500"}
      fontSize={12}
      fontWeight={500}
      href={`${VECHAIN_EXPLORER_URL}/accounts/${voter?.address}`}
      overflow={"hidden"}
      textOverflow={"ellipsis"}
      textAlign={"left"}
      display={"block"}
      w={"90px"}
      containerProps={{
        justifyContent: "center",
        width: "100%",
      }}>
      {voter?.domain || formatAddress(voter?.address || "")}
    </CopyLink>
  );
};

const votedOptionCellVariants = (choice: SingleChoiceEnum) => {
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

const VotedOptionCell = ({ option }: { option: SingleChoiceEnum }) => {
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
      justifyContent={"center"}
      color={"primary.500"}
      fontWeight={500}
      fontSize={12}
      isExternal
      href={`${VECHAIN_EXPLORER_URL}/transactions/${value}`}>
      <Text overflow={"hidden"} textOverflow={"ellipsis"}>
        {formatAddress(value)}
      </Text>
      <Icon as={ArrowLinkIcon} width={4} height={4} />
    </Link>
  );
};

interface VotersTableProps {
  data: VoteItem[];
}

export const VotersTable = ({ data }: VotersTableProps) => {
  const { LL } = useI18nContext();

  const votersColumn = [
    columnHelper.accessor("date", {
      cell: data => <BaseCell value={dayjs(data.getValue()).format("DD/MM/YYYY")} />,
      header: () => <TableHeader label={LL.proposal.voters_table.header.date()} />,
      id: "DATE",
      size: 120,
    }),
    columnHelper.accessor("voter", {
      cell: data => <AddressCell voter={data.getValue()} />,
      header: () => <TableHeader label={LL.proposal.voters_table.header.address()} />,
      id: "ADDRESS",
      size: 180,
    }),
    columnHelper.accessor("votingPower", {
      cell: data => <BaseCell value={data.getValue().toString()} />,
      header: () => <TableHeader label={LL.proposal.voters_table.header.voting_power()} />,
      id: "VOTING_POWER",
      size: 120,
    }),
    columnHelper.accessor("votedOption", {
      cell: data => <VotedOptionCell option={data.getValue() as SingleChoiceEnum} />,
      header: () => <TableHeader label={LL.proposal.voters_table.header.voted_option()} />,
      id: "VOTED_OPTION",
      size: 140,
    }),
    columnHelper.accessor("transactionId", {
      cell: data => <TransactionIdCell value={data.getValue()} />,
      header: () => <TableHeader label={LL.proposal.voters_table.header.transaction_id()} />,
      id: "TRANSACTION_ID",
      size: 180,
    }),
  ];

  return <DataTable columns={votersColumn} data={data} />;
};
