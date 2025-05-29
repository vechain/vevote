import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Icon, ModalBody, ModalHeader, useDisclosure } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { SearchInput } from "../ui/SearchInput";
import { Sort } from "../ui/SortDropdown";
import { DataTable } from "../ui/TableSkeleton";
import { votersColumn } from "./VotersTable";
import { VotingBaseDropdown } from "./VotingBaseDropdown";
import { FilterIcon, SortDescIcon, UserCheckIcon } from "@/icons";

export type VoteItem = {
  date: Date;
  address: string;
  node: string;
  nodeId: string;
  votingPower: number;
  votedOption: string;
  transactionId: string;
};

export const VotersModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();

  //todo: get votes from blockchain
  const votes = useMemo(
    () => [
      {
        date: new Date(),
        address: "0x1234567890abcdef1234567890abcdef12345678",
        node: "Node Name",
        nodeId: "Node ID",
        votingPower: 100,
        votedOption: "Option A",
        transactionId: "0xe1081a72832b983f5252a654436e2e0dc08e737b2ea553ada40735d67be3c14a",
      },
      {
        date: new Date(),
        address: "0x1234567890abcdef1234567890abcdef12345678",
        node: "Node Name 2",
        nodeId: "Node ID 2",
        votingPower: 3000,
        votedOption: "Yes",
        transactionId: "0xe1081a72832b983f5252a654436e2e0dc08e737b2ea553ada40735d67be3c14a",
      },
    ],
    [],
  );

  const nodes = useMemo(() => {
    return votes.reduce((acc, value) => {
      if (!acc.includes(value.node)) acc.push(value.node);
      return acc;
    }, [] as string[]);
  }, [votes]);

  const options = useMemo(() => {
    return votes.reduce((acc, value) => {
      if (!acc.includes(value.votedOption)) acc.push(value.votedOption);
      return acc;
    }, [] as string[]);
  }, [votes]);

  return (
    <>
      <Button onClick={onOpen} variant={"secondary"} leftIcon={<Icon as={UserCheckIcon} width={5} height={5} />}>
        {LL.proposal.see_all_voters()}
      </Button>
      <ModalSkeleton isOpen={isOpen} onClose={onClose} size={"4xl"}>
        <ModalHeader>
          <ModalTitle title={LL.voters()} icon={UserCheckIcon} />
          <TableFilters nodes={nodes} options={options} />
        </ModalHeader>
        <ModalBody overflowX={"auto"}>
          <DataTable columns={votersColumn} data={votes} />
        </ModalBody>
      </ModalSkeleton>
    </>
  );
};

const sortOptions = [Sort.Newest, Sort.Oldest, Sort.LeastParticipant, Sort.MostParticipant];

const TableFilters = ({ options, nodes }: { options: string[]; nodes: string[] }) => {
  const { LL } = useI18nContext();
  const [sort, setSort] = useState(Sort.Newest);
  const [selectedOption, setSelectedOption] = useState("");
  const [node, setNode] = useState("");

  return (
    <Flex gap={4} alignItems={"center"} pt={8} width={"full"}>
      <SearchInput size={"sm"} placeholder={LL.proposal.voters_table.filters.search_by_address()} />

      <VotingBaseDropdown
        label="Voting Options"
        options={options}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        ms={"auto"}
        icon={FilterIcon}
      />
      <VotingBaseDropdown
        label="Node"
        options={nodes}
        selectedOption={node}
        setSelectedOption={setNode}
        icon={FilterIcon}
      />
      <VotingBaseDropdown
        label="Sort by"
        options={sortOptions}
        selectedOption={sort}
        setSelectedOption={setSort}
        icon={SortDescIcon}
      />
    </Flex>
  );
};
