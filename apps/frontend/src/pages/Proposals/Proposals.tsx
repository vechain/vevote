import { ProposalsHeader } from "@/components/navbar/Header";
import { PageContainer } from "@/components/PageContainer";
import { CreateProposalButton } from "@/components/proposal/CreateProposalButton";
import { FiltersDropdown } from "@/components/ui/FiltersDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { ProposalsListSkeleton } from "@/components/ui/ProposalsListSkeleton";
import { SearchInput } from "@/components/ui/SearchInput";
import { useUser } from "@/contexts/UserProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { ProposalCardType } from "@/types/proposal";
import { areAddressesEqual } from "@/utils/address";
import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useMemo, useState, useEffect } from "react";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { ProposalCard } from "./ProposalCard";
import { useProposalsEvents } from "@/hooks/useProposalsEvents";
import { useProposalsUrlParams } from "@/hooks/useProposalsUrlParams";
import { useDebounce } from "@/hooks/useDebounce";

const ITEMS_PER_PAGE = 6;

export const Proposals = () => {
  const { LL } = useI18nContext();

  const { isWhitelisted } = useUser();
  const { account } = useWallet();

  const { draftProposal } = useCreateProposal();
  const { searchValue, statuses, setSearchValue, setStatuses } = useProposalsUrlParams();
  
  // Local state for immediate UI feedback
  const [searchInput, setSearchInput] = useState(searchValue);
  
  // Debounce the search input before updating URL
  const debouncedSearchInput = useDebounce(searchInput, 500);
  
  // Update URL when debounced value changes
  useEffect(() => {
    if (debouncedSearchInput !== searchValue) {
      setSearchValue(debouncedSearchInput);
    }
  }, [debouncedSearchInput, searchValue, setSearchValue]);
  
  // Sync local search input with URL parameter when it changes externally
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  const { proposals, loading, loadingMore, hasNextPage, fetchNextPage, totalCount } = useProposalsEvents({
    statuses,
    searchQuery: searchValue,
    pageSize: ITEMS_PER_PAGE,
  });

  const filteredProposals = useMemo(() => {
    const isDraftProposal = draftProposal && areAddressesEqual(draftProposal?.proposer, account?.address);
    return isDraftProposal ? [draftProposal, ...proposals] : proposals;
  }, [account?.address, draftProposal, proposals]);

  const canCreateProposal = useMemo(() => account?.address && isWhitelisted, [account?.address, isWhitelisted]);

  return (
    <>
      <ProposalsHeader />
      <PageContainer bg={"gray.50"} maxWidth={{ base: "100%", md: "60%" }}>
        <PageContainer.Header
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 6, md: 0 }}
          alignItems={{ base: "start", md: "center" }}>
          <Heading
            fontSize={{ base: 20, md: 32 }}
            fontWeight={600}
            color="primary.600"
            display={"flex"}
            alignItems={"center"}
            gap={{ base: 3, md: 6 }}
            paddingY={{ base: 4, md: 0 }}>
            {LL.proposals.title()}
          </Heading>
          <Flex
            marginLeft={{ base: 0, lg: "auto" }}
            gap={4}
            alignItems={"center"}
            justifyContent={{ base: "space-between", md: "flex-end" }}
            minWidth="0"
            overflow="hidden">
            <SearchInput
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onClear={() => setSearchInput("")}
              placeholder={LL.proposals.search_placeholder()}
            />
            <FiltersDropdown statuses={statuses} setStatuses={setStatuses} />
            {canCreateProposal && <CreateProposalButton />}
          </Flex>
        </PageContainer.Header>
        <PageContainer.Content>
          <ProposalsPanel
            proposals={filteredProposals}
            loading={loading}
            loadingMore={loadingMore}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            totalCount={totalCount}
          />
        </PageContainer.Content>
      </PageContainer>
    </>
  );
};

const ProposalsPanel = ({
  proposals,
  loading,
  loadingMore,
  hasNextPage,
  fetchNextPage,
  totalCount,
}: {
  proposals: ProposalCardType[];
  loading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  totalCount: number;
}) => {
  const { LL } = useI18nContext();

  if (loading) {
    return <ProposalsListSkeleton count={ITEMS_PER_PAGE} />;
  }

  return (
    <>
      <BasePanel>
        {proposals.length > 0 ? proposals.map((p, i) => <ProposalCard key={p.id || i} {...p} />) : <EmptyPanel />}
        {hasNextPage && (
          <Pagination
            text={LL.proposals.pagination({ current: proposals.length, total: totalCount })}
            current={proposals.length}
            total={totalCount}
            onShowMore={fetchNextPage}
            loading={loadingMore}
          />
        )}
      </BasePanel>
    </>
  );
};

const BasePanel = ({ children }: PropsWithChildren) => {
  const { account } = useWallet();
  const { isWhitelisted } = useUser();
  const canCreateProposal = useMemo(() => account?.address && isWhitelisted, [account?.address, isWhitelisted]);

  return (
    <Flex
      flexDirection={"column"}
      gap={{ base: 2, md: 4 }}
      paddingBottom={{ base: canCreateProposal ? "120px" : 0, md: 0 }}>
      {children}
    </Flex>
  );
};

const EmptyPanel = () => {
  const { LL } = useI18nContext();
  return (
    <Flex
      padding={20}
      justifyContent={"center"}
      alignItems={"center"}
      bg={"white"}
      direction={"column"}
      borderRadius={16}
      border={"1px"}
      borderColor={"#F1F2F3"}
      gap={6}>
      <Flex
        borderRadius={"full"}
        bg={"gray.100"}
        width={20}
        height={20}
        justifyContent={"center"}
        alignItems={"center"}>
        <Icon as={CircleInfoIcon} color={"gray.400"} width={8} height={8} />
      </Flex>
      <Text color={"gray.600"} fontSize={24} whiteSpace={"nowrap"}>
        {LL.proposals.no_proposals()}
      </Text>
    </Flex>
  );
};
