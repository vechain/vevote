import React, { useCallback, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { VotingBaseDropdown } from "@/components/proposal/VotingBaseDropdown";
import { FilterIcon, NodeIcon, SortDescIcon } from "@/icons";
import { NodeStrengthLevel } from "@/types/user";
import { Sort } from "@/components/ui/SortDropdown";

export const DEFAULT_FILTER = "All";

const sortOptions = [Sort.Newest, Sort.Oldest];

export interface VotersFiltersProps {
  options: string[];
  nodes: NodeStrengthLevel[];
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
    (value: string) => {
      onSelectedOptionChange(value);
    },
    [onSelectedOptionChange],
  );

  const handleNodeChange = useCallback(
    (value: NodeStrengthLevel | typeof DEFAULT_FILTER) => {
      onNodeChange(value);
    },
    [onNodeChange],
  );

  const handleSortChange = useCallback(
    (value: Sort) => {
      onSortChange(value);
    },
    [onSortChange],
  );

  const optionsWithAll = useMemo(() => [DEFAULT_FILTER, ...options], [options]);
  const nodesWithAll: (NodeStrengthLevel | typeof DEFAULT_FILTER)[] = useMemo(
    () => [DEFAULT_FILTER, ...nodes],
    [nodes],
  );

  return (
    <Flex gap={4} alignItems={"center"} pt={8} width={"full"} flexDirection={{ base: "column", md: "row" }}>
      <SearchInput
        size={"sm"}
        placeholder={LL.proposal.voters_table.filters.search_by_address()}
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <Flex gap={{ base: 3, md: 4 }} width={{ base: "full", md: "fit-content" }}>
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
    </Flex>
  );
};
