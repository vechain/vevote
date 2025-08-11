import { VotingBaseDropdown } from "@/components/proposal/VotingBaseDropdown";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sort } from "@/components/ui/SortDropdown";
import { useI18nContext } from "@/i18n/i18n-react";
import { FilterIcon, SortDescIcon } from "@/icons";
import { Flex } from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";

export const DEFAULT_FILTER = "All";

const sortOptions = [Sort.Newest, Sort.Oldest];

export interface VotersFiltersProps {
  options: string[];
  selectedOption: string;
  onSelectedOptionChange: (value: string) => void;
  sort: Sort;
  onSortChange: (value: Sort) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const VotersFiltersPanel = ({
  options,
  selectedOption,
  onSelectedOptionChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
}: VotersFiltersProps) => {
  const { LL } = useI18nContext();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
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

  const handleSortChange = useCallback(
    (value: Sort) => {
      onSortChange(value);
    },
    [onSortChange],
  );

  const optionsWithAll = useMemo(() => [DEFAULT_FILTER, ...options], [options]);

  return (
    <Flex gap={4} alignItems={"center"} pt={8} width={"full"} flexDirection={{ base: "column", md: "row" }}>
      <div
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        style={{ flex: 1, minWidth: 0 }}>
        <SearchInput
          size={"sm"}
          placeholder={LL.proposal.voters_table.filters.search_by_address()}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={e => e.stopPropagation()}
        />
      </div>

      <Flex gap={{ base: 3, md: 4 }} width={{ base: "full", md: "fit-content" }}>
        <VotingBaseDropdown
          label={LL.proposal.voters_table.filters.voting_options()}
          options={optionsWithAll}
          selectedOption={selectedOption}
          onChange={handleOptionChange}
          ms={"auto"}
          icon={FilterIcon}
        />

        <VotingBaseDropdown
          label={LL.proposal.voters_table.filters.sort_by()}
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
