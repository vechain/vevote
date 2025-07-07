import { Dispatch, SetStateAction } from "react";
import { Sort } from "../ui/SortDropdown";
import { VoteItem } from "./VotersModal";
import { useI18nContext } from "@/i18n/i18n-react";
import { Flex } from "@chakra-ui/react";
import { SearchInput } from "../ui/SearchInput";
import { VotingBaseDropdown } from "./VotingBaseDropdown";
import { FilterIcon, NodeIcon, SortDescIcon } from "@/icons";
import { NodeStrengthLevel } from "@/types/user";

export const DEFAULT_FILTER = "All";

const sortOptions = [Sort.Newest, Sort.Oldest];

type TableFiltersProps = {
  options: VoteItem["votedOptions"];
  nodes: string[];
  selectedOption?: string;
  setSelectedOption: Dispatch<SetStateAction<string>>;
  node?: NodeStrengthLevel | typeof DEFAULT_FILTER;
  setNode: Dispatch<SetStateAction<NodeStrengthLevel | typeof DEFAULT_FILTER>>;
  sort: Sort;
  setSort: Dispatch<SetStateAction<Sort>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

export const TableFilters = ({
  options,
  nodes,
  node,
  selectedOption,
  setNode,
  setSelectedOption,
  setSort,
  sort,
  searchQuery,
  setSearchQuery,
}: TableFiltersProps) => {
  const { LL } = useI18nContext();

  return (
    <Flex gap={4} alignItems={"center"} pt={8} width={"full"}>
      <SearchInput
        size={"sm"}
        placeholder={LL.proposal.voters_table.filters.search_by_address()}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      <VotingBaseDropdown
        label="Voting Options"
        options={options}
        selectedOption={selectedOption}
        onChange={v => {
          setSelectedOption(v as string);
        }}
        ms={"auto"}
        icon={FilterIcon}
      />
      <VotingBaseDropdown
        label="Node"
        options={nodes}
        selectedOption={node}
        onChange={v => {
          setNode(v as NodeStrengthLevel | typeof DEFAULT_FILTER);
        }}
        icon={NodeIcon}
      />
      <VotingBaseDropdown
        label="Sort by"
        options={sortOptions}
        selectedOption={sort}
        onChange={v => setSort(v as Sort)}
        icon={SortDescIcon}
      />
    </Flex>
  );
};
