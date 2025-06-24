import { ProposalsHeader } from "@/components/navbar/Header";
import { PageContainer } from "@/components/PageContainer";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sort, SortDropdown } from "@/components/ui/SortDropdown";
import { useProposalsEvents } from "@/hooks/useProposalsEvents";
import { useUser } from "@/contexts/UserProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon, CirclePlusIcon, VoteIcon } from "@/icons";
import { ProposalCardType, ProposalStatus } from "@/types/proposal";
import { Button, Flex, Heading, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import dayjs from "dayjs";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { ProposalCard } from "./ProposalCard";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { Routes } from "@/types/routes";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

export const Proposals = () => {
  const { isWhitelisted } = useUser();
  const { account } = useWallet();

  const { draftProposal } = useCreateProposal();
  const [sort, setSort] = useState<Sort>(Sort.Newest);
  const [searchValue, setSearchValue] = useState("");
  const { LL } = useI18nContext();

  const { proposals, loading } = useProposalsEvents();

  const navigate = useNavigate();

  const proposalsBySearch = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    const isDraftProposal = draftProposal && draftProposal?.proposer === account?.address;
    const filteredProposals = proposals.filter(({ title }) => title.toLowerCase().includes(searchLower)).reverse();

    return isDraftProposal ? [draftProposal, ...filteredProposals] : filteredProposals;
  }, [account?.address, draftProposal, proposals, searchValue]);

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

  const onCreate = useCallback(() => {
    trackEvent(MixPanelEvent.CTA_CREATE_PROPOSAL_CLICKED, { page: "proposals" });
    navigate(Routes.CREATE_PROPOSAL);
  }, [navigate]);

  return (
    <>
      <ProposalsHeader />
      <PageContainer bg={"gray.50"}>
        <PageContainer.Header>
          <Heading fontSize={32} fontWeight={600} color="primary.600" display={"flex"} alignItems={"center"} gap={6}>
            <Icon as={VoteIcon} width={8} height={8} marginRight={2} />
            {LL.proposals.title()}
          </Heading>
          {canCreateProposal && (
            <Button marginLeft={"auto"} onClick={onCreate}>
              <Icon as={CirclePlusIcon} />
              {LL.proposals.create()}
            </Button>
          )}
        </PageContainer.Header>
        <PageContainer.Content>
          <Tabs>
            <Flex>
              <TabList>
                <Tab>{LL.all()}</Tab>
                <Tab>{LL.badge.voting()}</Tab>
                <Tab>{LL.badge.upcoming()}</Tab>
                <Tab>{LL.finished()}</Tab>
              </TabList>
              <Flex marginLeft={"auto"} gap={4} alignItems={"center"}>
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
    <TabPanel display={"flex"} flexDirection={"column"} gap={4}>
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
        <Text color={"gray.600"} fontSize={24}>
          {LL.proposals.no_proposals()}
        </Text>
      </Flex>
    </TabPanel>
  );
};
