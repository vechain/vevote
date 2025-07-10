import { ProposalsHeader } from "@/components/navbar/Header";
import { PageContainer } from "@/components/PageContainer";
import { CreateProposalButton } from "@/components/proposal/CreateProposalButton";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sort, SortDropdown } from "@/components/ui/SortDropdown";
import { useUser } from "@/contexts/UserProvider";
import { useProposalsEvents } from "@/hooks/useProposalsEvents";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon, VoteIcon } from "@/icons";
import { ProposalCardType, ProposalStatus } from "@/types/proposal";
import { Flex, Heading, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import dayjs from "dayjs";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { ProposalCard } from "./ProposalCard";
import { areAddressesEqual } from "@/utils/address";
import { useAllUserNodes } from "@/hooks/useUserQueries";

const ITEMS_PER_PAGE = 6;

export const Proposals = () => {
  const { isWhitelisted } = useUser();
  const { account } = useWallet();

  const { draftProposal } = useCreateProposal();
  const [sort, setSort] = useState<Sort>(Sort.Newest);
  const [searchValue, setSearchValue] = useState("");
  const { LL } = useI18nContext();

  const { proposals, loading } = useProposalsEvents();

  const proposalsBySearch = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    const isDraftProposal = draftProposal && areAddressesEqual(draftProposal?.proposer, account?.address);
    const filteredProposals =
      sort === Sort.Newest
        ? proposals.filter(({ title }) => title.toLowerCase().includes(searchLower)).reverse()
        : proposals.filter(({ title }) => title.toLowerCase().includes(searchLower));
    return isDraftProposal ? [draftProposal, ...filteredProposals] : filteredProposals;
  }, [account?.address, draftProposal, proposals, searchValue, sort]);

  const proposalsByTabStatus: Record<string, ProposalCardType[]> = useMemo(() => {
    const finishedStatuses: ProposalStatus[] = ["canceled", "rejected", "min-not-reached"];
    return {
      all: proposalsBySearch,
      voting: proposalsBySearch.filter(({ status }) => status === "voting"),
      upcoming: proposalsBySearch.filter(({ status }) => status === "upcoming"),
      finished: proposalsBySearch.filter(
        ({ endDate, status }) => dayjs(endDate).isBefore(dayjs()) || finishedStatuses.includes(status),
      ),
    };
  }, [proposalsBySearch]);

  const canCreateProposal = useMemo(() => account?.address && isWhitelisted, [account?.address, isWhitelisted]);

  const { nodes } = useAllUserNodes();

  useEffect(() => {
    console.log("All User Nodes_____________________:", nodes);
  }, [nodes]);

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
            <Icon as={VoteIcon} width={{ base: 6, md: 8 }} height={{ base: 6, md: 8 }} marginRight={2} />
            {LL.proposals.title()}
          </Heading>
          {canCreateProposal && <CreateProposalButton />}
        </PageContainer.Header>
        <PageContainer.Content>
          <Tabs>
            <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 6, lg: 0 }}>
              <TabList gridTemplateColumns={"repeat(4, 1fr)"}>
                <Tab>{LL.all()}</Tab>
                <Tab>{LL.badge.voting()}</Tab>
                <Tab>{LL.badge.upcoming()}</Tab>
                <Tab>{LL.finished()}</Tab>
              </TabList>
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
                <SortDropdown sort={sort} setSort={setSort} />
              </Flex>
            </Flex>

            <TabPanels>
              <ProposalsPanel proposals={proposalsByTabStatus.all} loading={loading} />
              <ProposalsPanel proposals={proposalsByTabStatus.voting} loading={loading} />
              <ProposalsPanel proposals={proposalsByTabStatus.upcoming} loading={loading} />
              <ProposalsPanel proposals={proposalsByTabStatus.finished} loading={loading} />
            </TabPanels>
          </Tabs>
        </PageContainer.Content>
      </PageContainer>
    </>
  );
};

const ProposalsPanel = ({ proposals, loading }: { proposals: ProposalCardType[]; loading: boolean }) => {
  const { LL } = useI18nContext();
  const [limit, setLimit] = useState<number>(ITEMS_PER_PAGE);
  const filteredProposals = useMemo(() => proposals.filter((_p, i) => i < limit), [proposals, limit]);

  return (
    <>
      <BasePanel>
        {!loading && filteredProposals.length > 0 ? (
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
  return (
    <TabPanel display={"flex"} flexDirection={"column"} gap={{ base: 2, md: 4 }}>
      {children}
    </TabPanel>
  );
};

const EmptyPanel = () => {
  const { LL } = useI18nContext();
  return (
    <TabPanel>
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
    </TabPanel>
  );
};
