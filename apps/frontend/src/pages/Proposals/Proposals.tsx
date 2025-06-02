import { PageContainer } from "@/components/PageContainer";
import { Button, Flex, Heading, Icon, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { MdOutlineHowToVote } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sort, SortDropdown } from "@/components/ui/SortDropdown";
import { PropsWithChildren, useContext, useMemo, useState } from "react";
import { ProposalCardType } from "@/types/proposal";
import { IconBadge } from "@/components/ui/IconBadge";
import { Status } from "@/components/ui/Status";
import { CiCircleInfo } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { CiCalendar } from "react-icons/ci";
import { useFormatDate } from "@/hooks/useFormatDate";
import { FaChevronRight } from "react-icons/fa";
import dayjs from "dayjs";
import { useI18nContext } from "@/i18n/i18n-react";
import { Pagination } from "@/components/ui/Pagination";
import { ProposalsHeader } from "@/components/navbar/Header";
import { useCreateProposal } from "../CreateProposal/CreateProposalProvider";
import { useProposalsEvents } from "@/hooks/useProposalsEvents";
import { useHasVoted } from "@/hooks/useCastVote";
import { UserContext } from "@/contexts/UserProvider";

const ITEMS_PER_PAGE = 6;

export const Proposals = () => {
  const { isAdmin } = useContext(UserContext);

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
      <PageContainer>
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

const ProposalCard = ({ status, title, endDate, startDate, id }: ProposalCardType) => {
  const variant = useMemo(() => {
    switch (status) {
      case "min-not-reached":
        return "rejected";
      default:
        return status;
    }
  }, [status]);

  const { hasVoted } = useHasVoted({ proposalId: id !== "draft" ? id : undefined });

  return (
    <Flex
      width={"100%"}
      paddingY={8}
      paddingLeft={8}
      paddingRight={6}
      bg={"white"}
      borderRadius={16}
      border={"1px"}
      borderColor={"#F1F2F3"}
      gap={6}
      alignItems={"center"}>
      <Flex width={"100%"} direction={"column"} gap={6}>
        <Flex gap={4} alignItems={"center"}>
          <IconBadge variant={variant} />
          {hasVoted && <Status text={"Voted"} marginLeft={"auto"} />}
        </Flex>
        <Flex gap={4} alignItems={"start"} direction={"column"}>
          <Text overflow={"hidden"} fontSize={20} fontWeight={600} color={"gray.600"}>
            {title}
          </Text>
          <DateItem startDate={startDate} endDate={endDate} status={status} />
        </Flex>
      </Flex>
      <Link paddingX={0} bg={"transparent"} _hover={{ bg: "transparent" }} href={`/proposal/${id}`}>
        <Icon as={FaChevronRight} width={4} height={4} color={"gray.500"} />
      </Link>
    </Flex>
  );
};

const DateItem = ({ startDate, endDate, status }: Pick<ProposalCardType, "endDate" | "startDate" | "status">) => {
  const { LL } = useI18nContext();

  const { leftVotingDate, formattedDate } = useFormatDate();
  const date = useMemo(() => {
    switch (status) {
      case "voting":
        return leftVotingDate(endDate);
      case "upcoming":
        return formattedDate(startDate);
      default:
        return formattedDate(endDate);
    }
  }, [status, leftVotingDate, endDate, formattedDate, startDate]);

  const icon = useMemo(() => {
    switch (status) {
      case "voting":
        return IoMdTime;
      default:
        return CiCalendar;
    }
  }, [status]);

  if (!date) return null;

  return (
    <Flex alignItems={"center"} gap={2}>
      <Icon as={icon} width={4} height={4} color={"gray.700"} />
      {status !== "voting" && (
        <Text color={"gray.400"} fontSize={14}>
          {status === "upcoming" ? LL.start() : LL.end()}
        </Text>
      )}

      <Text fontSize={14}>{date}</Text>
    </Flex>
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
