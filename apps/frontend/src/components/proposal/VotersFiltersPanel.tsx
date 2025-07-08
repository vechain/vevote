import React, { useCallback, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { SearchInput } from "../ui/SearchInput";
import { VotingBaseDropdown } from "./VotingBaseDropdown";
import { FilterIcon, NodeIcon, SortDescIcon } from "@/icons";
import { NodeStrengthLevel } from "@/types/user";
import { Sort } from "../ui/SortDropdown";

export const DEFAULT_FILTER = "All";

const sortOptions = [Sort.Newest, Sort.Oldest];

export interface VotersFiltersProps {
  options: string[];
  nodes: string[];
  selectedOption: string;
  onSelectedOptionChange: (value: string) => void;
  node: NodeStrengthLevel | typeof DEFAULT_FILTER;
  onNodeChange: (value: NodeStrengthLevel | typeof DEFAULT_FILTER) => void;
  sort: Sort;
  onSortChange: (value: Sort) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const VotersFiltersPanel = ({
  options,
  nodes,
  selectedOption,
  onSelectedOptionChange,
  node,
  onNodeChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
}: VotersFiltersProps) => {
  const { LL } = useI18nContext();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  const handleOptionChange = useCallback(
    (value: unknown) => {
      onSelectedOptionChange(value as string);
    },
    [onSelectedOptionChange],
  );

  const handleNodeChange = useCallback(
    (value: unknown) => {
      onNodeChange(value as NodeStrengthLevel | typeof DEFAULT_FILTER);
    },
    [onNodeChange],
  );

  const handleSortChange = useCallback(
    (value: unknown) => {
      onSortChange(value as Sort);
    },
    [onSortChange],
  );

  const optionsWithAll = useMemo(() => [DEFAULT_FILTER, ...options], [options]);
  const nodesWithAll = useMemo(() => [DEFAULT_FILTER, ...nodes], [nodes]);

  return (
    <Flex gap={4} alignItems={"center"} pt={8} width={"full"}>
      <SearchInput
        size={"sm"}
        placeholder={LL.proposal.voters_table.filters.search_by_address()}
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <VotingBaseDropdown
        label="Voting Options"
        options={optionsWithAll}
        selectedOption={selectedOption}
        onChange={handleOptionChange}
        ms={"auto"}
        icon={FilterIcon}
      />

      <VotingBaseDropdown
        label="Node"
        options={nodesWithAll}
        selectedOption={node}
        onChange={handleNodeChange}
        icon={NodeIcon}
      />

      <VotingBaseDropdown
        label="Sort by"
        options={sortOptions}
        selectedOption={sort}
        onChange={handleSortChange}
        icon={SortDescIcon}
        renderValue={(value: Sort) => LL.filters.sort[value]()}
      />
    </Flex>
  );
};
