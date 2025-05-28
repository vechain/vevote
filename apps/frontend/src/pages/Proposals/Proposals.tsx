import { ProposalsHeader } from "@/components/navbar/Header";
import { PageContainer } from "@/components/PageContainer";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sort, SortDropdown } from "@/components/ui/SortDropdown";
import { useProposalsEvents } from "@/hooks/useProposalsEvents";
import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType } from "@/types/proposal";
import { Button, Flex, Heading, Icon, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { PropsWithChildren, useMemo, useState } from "react";
import { CiCircleInfo, CiCirclePlus } from "react-icons/ci";
import { MdOutlineHowToVote } from "react-icons/md";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { ProposalCard } from "./ProposalCard";

const ITEMS_PER_PAGE = 6;

//todo: get from user provider
const isAdmin = true;

export const Proposals = () => {
  const { draftProposal } = useCreateProposal();
  const [sort, setSort] = useState<Sort>(Sort.Newest);
  const [searchValue, setSearchValue] = useState<string>("");
  const { LL } = useI18nContext();

  const { proposals, loading } = useProposalsEvents();

  const proposalsBySearch = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    const mockAndDraft = draftProposal ? [draftProposal, ...proposals] : proposals;
    return mockAndDraft.filter(({ title }) => title.toLowerCase().includes(searchLower));
  }, [draftProposal, proposals, searchValue]);

  const proposalsByTabStatus: Record<string, ProposalCardType[]> = useMemo(() => {
    return {
      all: proposalsBySearch,
      voting: proposalsBySearch.filter(({ status }) => status === "voting"),
      upcoming: proposalsBySearch.filter(({ status }) => status === "upcoming"),
      finished: proposalsBySearch.filter(({ startDate, endDate }) => dayjs(endDate || startDate).isBefore(dayjs())),
    };
  }, [proposalsBySearch]);

  return (
    <>
      <ProposalsHeader />
      <PageContainer bg={"gray.50"}>
        <PageContainer.Header>
          <Heading fontSize={32} fontWeight={600} color="primary.600" display={"flex"} alignItems={"center"} gap={6}>
            <Icon as={MdOutlineHowToVote} width={8} height={8} color={"primary.600"} marginRight={2} />
            {LL.proposals.title()}
          </Heading>
          {isAdmin && (
            <Button as={Link} href="/create-proposal" marginLeft={"auto"}>
              <Icon as={CiCirclePlus} width={6} height={6} />
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
          <Icon as={CiCircleInfo} width={8} height={8} color={"gray.400"} />
        </Flex>
        <Text color={"gray.600"} fontSize={24}>
          {LL.proposals.no_proposals()}
        </Text>
      </Flex>
    </TabPanel>
  );
};
