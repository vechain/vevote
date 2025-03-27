import { PageContainer } from "@/components/PageContainer";
import { Button, Flex, Heading, Icon, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { MdOutlineHowToVote } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sort, SortDropdown } from "@/components/ui/SortDropdown";
import { PropsWithChildren, useMemo, useState } from "react";
import { ProposalCardType } from "@/types/proposal";
import { IconBadge } from "@/components/ui/IconBadge";
import { Status } from "@/components/ui/Status";
import { CiCircleInfo } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { CiCalendar } from "react-icons/ci";
import { useFormatDate } from "@/hooks/useFormatDate";
import { FaChevronRight } from "react-icons/fa";
import dayjs from "dayjs";

const mockProposals: ProposalCardType[] = [
  {
    isVoted: true,
    status: "voting",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date("2025-03-29T20:24:00"),
  },
  {
    isVoted: false,
    status: "upcoming",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    startDate: new Date("2025-05-10T03:24:00"),
  },
  {
    isVoted: true,
    status: "approved",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date("2025-08-20T03:24:00"),
  },
  {
    isVoted: true,
    status: "executed",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date("2025-07-05T03:12:00"),
  },
  {
    isVoted: true,
    status: "rejected",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
    endDate: new Date(),
  },
  {
    isVoted: false,
    status: "canceled",
    title: "All-Stakeholder Voting Proposal: Galactica Launch & Governance Upgrade",
  },
];

export const Home = () => {
  const [sort, setSort] = useState<Sort>(Sort.Newest);
  return (
    <PageContainer>
      <PageContainer.Header>
        <Heading fontSize={32} fontWeight={600} color="primary.600" display={"flex"} alignItems={"center"} gap={6}>
          <Icon as={MdOutlineHowToVote} width={8} height={8} color={"primary.600"} marginRight={2} />
          {"Proposals"}
        </Heading>
        <Button marginLeft={"auto"} gap={3} color={"white"} bgColor={"primary.500"} _hover={{ bgColor: "primary.700" }}>
          <Icon as={CiCirclePlus} width={6} height={6} />
          {"Create Proposal"}
        </Button>
      </PageContainer.Header>
      <PageContainer.Content>
        <Tabs>
          <Flex>
            <TabList>
              <Tab>{"All"}</Tab>
              <Tab>{"Voting now"}</Tab>
              <Tab>{"Upcoming"}</Tab>
              <Tab>{"Finished"}</Tab>
            </TabList>
            <Flex marginLeft={"auto"} gap={4} alignItems={"center"}>
              <SearchInput placeholder={"Search proposals..."} />
              <SortDropdown sort={sort} setSort={setSort} />
            </Flex>
          </Flex>

          <TabPanels>
            <BasePanel>
              {mockProposals.map(proposal => (
                <ProposalCard key={proposal.title} {...proposal} />
              ))}
            </BasePanel>
            <BasePanel>
              {mockProposals.map(
                proposal => proposal.status === "voting" && <ProposalCard key={proposal.title} {...proposal} />,
              )}
            </BasePanel>
            <BasePanel>
              {mockProposals.map(
                proposal => proposal.status === "upcoming" && <ProposalCard key={proposal.title} {...proposal} />,
              )}
            </BasePanel>
            <BasePanel>
              {mockProposals
                .filter(p => dayjs(p.endDate).isBefore())
                .map(proposal => (
                  <ProposalCard key={proposal.title} {...proposal} />
                ))}
            </BasePanel>
          </TabPanels>
        </Tabs>
      </PageContainer.Content>
    </PageContainer>
  );
};

const BasePanel = ({ children }: PropsWithChildren) => {
  if (!children) return <EmptyPanel />;
  return (
    <TabPanel display={"flex"} flexDirection={"column"} gap={4}>
      {children}
    </TabPanel>
  );
};

const ProposalCard = ({ isVoted, status, title, endDate, startDate }: ProposalCardType) => {
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
          <IconBadge variant={status} />
          {isVoted && <Status text={"Voted"} marginLeft={"auto"} />}
        </Flex>
        <Flex gap={4} alignItems={"start"} direction={"column"}>
          <Text overflow={"hidden"} fontSize={20} fontWeight={600} color={"gray.600"}>
            {title}
          </Text>
          <DateItem startDate={startDate} endDate={endDate} status={status} />
        </Flex>
      </Flex>
      <Link paddingX={0} bg={"transparent"} _hover={{ bg: "transparent" }}>
        <Icon as={FaChevronRight} width={4} height={4} color={"gray.500"} />
      </Link>
    </Flex>
  );
};

const DateItem = ({ startDate, endDate, status }: Pick<ProposalCardType, "endDate" | "startDate" | "status">) => {
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
          {status === "upcoming" ? "Start" : "End"}
        </Text>
      )}

      <Text fontSize={14}>{date}</Text>
    </Flex>
  );
};

const EmptyPanel = () => {
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
          {"No proposals found"}
        </Text>
      </Flex>
    </TabPanel>
  );
};
