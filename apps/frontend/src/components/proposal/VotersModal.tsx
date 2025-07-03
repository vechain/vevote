import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Icon, ModalBody, ModalHeader, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { SearchInput } from "../ui/SearchInput";
import { Sort } from "../ui/SortDropdown";
import { DataTable } from "../ui/TableSkeleton";
import { votersColumn } from "./VotersTable";
import { VotingBaseDropdown } from "./VotingBaseDropdown";
import { FilterIcon, SortDescIcon, UserCheckIcon } from "@/icons";
import { useVotesInfo } from "@/hooks/useCastVote";
import { useProposal } from "./ProposalProvider";
import { BaseOption, SingleChoiceEnum, VotingEnum } from "@/types/proposal";

export type VoteItem = {
  date: Date;
  address: string;
  nodes: string[];
  votingPower: number;
  votedOptions: (SingleChoiceEnum | BaseOption["value"])[];
  transactionId: string;
};

export const VotersModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { proposal } = useProposal();

  const { votedInfo } = useVotesInfo({ proposalId: proposal.id });

  useEffect(() => {
    console.log("Votes:", votedInfo);
  });

  const getVotingChoicesFromBinary = useCallback(
    (choices: string[]) => {
      return choices
        .map((choice, index) => {
          if (Number(choice) === 1) {
            if (proposal.votingType === VotingEnum.MULTIPLE_OPTIONS) return proposal.votingOptions[index].value;
            return proposal.votingOptions[index];
          }
        })
        .filter(Boolean) as (SingleChoiceEnum | BaseOption["value"])[];
    },
    [proposal.votingOptions, proposal.votingType],
  );

  const votes = useMemo(() => {
    return (
      votedInfo?.map(
        (vote): VoteItem => ({
          date: vote.date,
          address: vote.voter,
          nodes: vote.stargateNFTs,
          votingPower: Number(vote.weight) / 100,
          votedOptions: getVotingChoicesFromBinary(vote.choices) || [],
          transactionId: vote.transactionId,
        }),
      ) || []
    );
  }, [getVotingChoicesFromBinary, votedInfo]);

  const nodes = useMemo(() => {
    return votes.reduce((acc, value) => {
      value.nodes.forEach(node => {
        if (!acc.includes(node)) acc.push(node);
      });
      return acc;
    }, [] as string[]);
  }, [votes]);

  const options = useMemo(() => {
    return votes.reduce(
      (acc, value) => {
        value?.votedOptions.forEach(option => {
          if (!acc.includes(option)) acc.push(option);
        });
        return acc;
      },
      [] as VoteItem["votedOptions"],
    );
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

const TableFilters = ({ options, nodes }: { options: VoteItem["votedOptions"]; nodes: string[] }) => {
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
