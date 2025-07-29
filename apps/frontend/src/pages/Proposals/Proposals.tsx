import { ProposalsHeader } from "@/components/navbar/Header";
import { PageContainer } from "@/components/PageContainer";
import { CreateProposalButton } from "@/components/proposal/CreateProposalButton";
import { FiltersDropdown } from "@/components/ui/FiltersDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { ProposalsListSkeleton } from "@/components/ui/ProposalsListSkeleton";
import { SearchInput } from "@/components/ui/SearchInput";
import { useUser } from "@/contexts/UserProvider";
import { useProposalsEvents } from "@/hooks/useProposalsEvents";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { FilterStatuses, ProposalCardType } from "@/types/proposal";
import { areAddressesEqual } from "@/utils/address";
import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { PropsWithChildren, useMemo, useState } from "react";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { ProposalCard } from "./ProposalCard";
import { filterStatus } from "@/utils/proposals/helpers";

const ITEMS_PER_PAGE = 6;

export const Proposals = () => {
  const { LL } = useI18nContext();

  const { isWhitelisted } = useUser();
  const { account } = useWallet();

  const { draftProposal } = useCreateProposal();
  const [searchValue, setSearchValue] = useState("");
  const [statuses, setStatuses] = useState<FilterStatuses[]>([
    "approved",
    "canceled",
    "draft",
    "executed",
    "rejected",
    "upcoming",
    "voting",
  ]);

  const { proposals, loading } = useProposalsEvents();

  const filteredProposals = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    const isDraftProposal = draftProposal && areAddressesEqual(draftProposal?.proposer, account?.address);
    const filteredProposals = proposals
      .filter(({ title }) => title.toLowerCase().includes(searchLower))
      .filter(({ status }) => filterStatus(statuses, status))
      .reverse();
    return isDraftProposal ? [draftProposal, ...filteredProposals] : filteredProposals;
  }, [account?.address, draftProposal, proposals, searchValue, statuses]);

  const canCreateProposal = useMemo(() => account?.address && isWhitelisted, [account?.address, isWhitelisted]);

  return (
    <>
      <ProposalsHeader />
      <PageContainer bg={"gray.50"}>
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
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
              placeholder={LL.proposals.search_placeholder()}
            />
            <FiltersDropdown statuses={statuses} setStatuses={setStatuses} />
            {canCreateProposal && <CreateProposalButton />}
          </Flex>
        </PageContainer.Header>
        <PageContainer.Content>
          <ProposalsPanel proposals={filteredProposals} loading={loading} />
        </PageContainer.Content>
      </PageContainer>
    </>
  );
};

const ProposalsPanel = ({ proposals, loading }: { proposals: ProposalCardType[]; loading: boolean }) => {
  const { LL } = useI18nContext();
  const [limit, setLimit] = useState<number>(ITEMS_PER_PAGE);
  const filteredProposals = useMemo(() => proposals.filter((_p, i) => i < limit), [proposals, limit]);

  if (loading) {
    return <ProposalsListSkeleton count={ITEMS_PER_PAGE} />;
  }

  return (
    <>
      <BasePanel>
        {filteredProposals.length > 0 ? (
          filteredProposals.map((p, i) => <ProposalCard key={i} {...p} />)
        ) : (
          <EmptyPanel />
        )}
        <Pagination
          text={LL.proposals.pagination({ current: filteredProposals.length, total: proposals.length })}
          current={filteredProposals.length}
          total={proposals.length}
          onShowMore={() => {
            setLimit(prev => prev + ITEMS_PER_PAGE);
          }}
        />
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
