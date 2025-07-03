import { useVotesInfo } from "@/hooks/useCastVote";
import { useI18nContext } from "@/i18n/i18n-react";
import { UserCheckIcon } from "@/icons";
import { BaseOption, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { Button, Icon, ModalBody, ModalHeader, useDisclosure } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { Sort } from "../ui/SortDropdown";
import { DataTable } from "../ui/TableSkeleton";
import { useProposal } from "./ProposalProvider";
import { votersColumn } from "./VotersTable";
import { TableFilters } from "./TableFilters";

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

  const [sort, setSort] = useState(Sort.Newest);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [node, setNode] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { votedInfo } = useVotesInfo({ proposalId: proposal.id });

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

  const filteredVotes = useMemo(() => {
    const filtered = votes.filter(vote => {
      const matchesNode = node ? vote.nodes.includes(node) : true;
      const matchesOption = selectedOption
        ? vote.votedOptions.includes(selectedOption as SingleChoiceEnum | BaseOption["value"])
        : true;
      const matchesSearch = searchQuery ? vote.address.toLowerCase().includes(searchQuery.toLowerCase()) : true;

      return matchesNode && matchesOption && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (sort === Sort.Newest) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sort === Sort.Oldest) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

    return filtered;
  }, [votes, node, selectedOption, searchQuery, sort]);

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
          <TableFilters
            nodes={nodes}
            options={options}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            node={node}
            setNode={setNode}
            sort={sort}
            setSort={setSort}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </ModalHeader>
        <ModalBody overflowX={"auto"}>
          <DataTable columns={votersColumn} data={filteredVotes} />
        </ModalBody>
      </ModalSkeleton>
    </>
  );
};
