import { useI18nContext } from "@/i18n/i18n-react";
import { UserCheckIcon } from "@/icons";
import { Button, Icon, ModalBody, ModalHeader, useDisclosure, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { Sort } from "../ui/SortDropdown";
import { useProposal } from "./ProposalProvider";
import { VotersTable } from "./VotersTable";
import { VotersFiltersPanel, DEFAULT_FILTER } from "./VotersFiltersPanel";
import { useVotersData } from "@/hooks/useVotersData";
import { NodeStrengthLevel } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";

export const VotersModal = () => {
  const { LL } = useI18nContext();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { proposal } = useProposal();

  const [selectedOption, setSelectedOption] = useState(DEFAULT_FILTER);
  const [node, setNode] = useState<NodeStrengthLevel | typeof DEFAULT_FILTER>(DEFAULT_FILTER);
  const [sort, setSort] = useState(Sort.Newest);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { votes, filterOptions, nodeOptions, isLoading, error } = useVotersData({
    proposalId: proposal.id,
    votingType: proposal.votingType,
    votingOptions: proposal.votingOptions,
    filters: {
      selectedOption,
      node,
      sort,
      searchQuery: debouncedSearchQuery,
    },
  });

  const handleSelectedOptionChange = useCallback((value: string) => {
    setSelectedOption(value);
  }, []);

  const handleNodeChange = useCallback((value: NodeStrengthLevel | typeof DEFAULT_FILTER) => {
    setNode(value);
  }, []);

  const handleSortChange = useCallback((value: Sort) => {
    setSort(value);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleModalOpen = useCallback(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <Button onClick={handleModalOpen} variant={"secondary"} leftIcon={<Icon as={UserCheckIcon} width={5} height={5} />}>
        {LL.proposal.see_all_voters()}
      </Button>
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
              Failed to load voters data. Please try again.
            </Alert>
          )}
          {!isLoading && !error && <VotersTable data={votes} />}
        </ModalBody>
      </ModalSkeleton>
    </>
  );
};