import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowRightIcon, UserCheckIcon } from "@/icons";
import { Icon, ModalBody, ModalHeader, useDisclosure, Spinner, Alert, AlertIcon, Flex, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { VotersFiltersPanel, DEFAULT_FILTER } from "./components/VotersFiltersPanel";
import { useVotersData } from "@/hooks/useVotersData";
import { NodeStrengthLevel } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";
import { Sort } from "@/components/ui/SortDropdown";
import { ModalSkeleton, ModalTitle } from "@/components/ui/ModalSkeleton";
import { TablePagination } from "@/components/ui/TablePagination";
import { VotersTable } from "./components/VotersTable";

export const AllVotersModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { proposal } = useProposal();

  const [selectedOption, setSelectedOption] = useState(DEFAULT_FILTER);
  const [node, setNode] = useState<NodeStrengthLevel | typeof DEFAULT_FILTER>(DEFAULT_FILTER);
  const [sort, setSort] = useState(Sort.Newest);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { votes, pagination, filterOptions, nodeOptions, isLoading, error, originalVotes } = useVotersData({
    proposalId: proposal.id,
    filters: {
      selectedOption,
      node,
      sort,
      searchQuery: debouncedSearchQuery,
    },
    page: currentPage,
    pageSize: 10,
  });

  const handleSelectedOptionChange = useCallback((value: string) => {
    setSelectedOption(value);
    setCurrentPage(1);
  }, []);

  const handleNodeChange = useCallback((value: NodeStrengthLevel | typeof DEFAULT_FILTER) => {
    setNode(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: Sort) => {
    setSort(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (originalVotes.length === 0) return null;

  return (
    <>
      <Flex alignItems={"center"} gap={1} onClick={onOpen} cursor={"pointer"}>
        <Text fontSize={{ base: "14px", md: "16px" }} color={"primary.600"} fontWeight={500}>
          {LL.proposal.see_all_voters()}
        </Text>
        <Icon as={ArrowRightIcon} width={4} height={4} color={"primary.600"} />
      </Flex>
      <ModalSkeleton isOpen={isOpen} onClose={onClose} size={"4xl"}>
        <ModalHeader>
          <ModalTitle title={LL.voters()} icon={UserCheckIcon} />
          <VotersFiltersPanel
            options={filterOptions}
            nodes={nodeOptions}
            selectedOption={selectedOption}
            onSelectedOptionChange={handleSelectedOptionChange}
            node={node}
            onNodeChange={handleNodeChange}
            sort={sort}
            onSortChange={handleSortChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </ModalHeader>
        <ModalBody overflowX={"auto"}>
          {isLoading && <Spinner size="lg" />}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {LL.field_errors.failed_load_voters()}
            </Alert>
          )}
          {!isLoading && !error && votes.length === 0 && (
            <Alert status="info">
              <AlertIcon />
              No voters found matching your search criteria.
            </Alert>
          )}
          {!isLoading && !error && votes.length > 0 && <VotersTable data={votes} />}
        </ModalBody>
        {!isLoading && !error && pagination && pagination.totalPages > 1 && (
          <TablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </ModalSkeleton>
    </>
  );
};
