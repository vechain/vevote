import { Flex, Text, Icon } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { CalendarIcon } from "@/icons";
import { useFormatDate } from "@/hooks/useFormatDate";
import { ProposalStatus } from "@/types/proposal";
import { useI18nContext } from "@/i18n/i18n-react";
import { useMemo } from "react";

enum TimelineItemStatus {
  COMPLETED = "completed",
  ACTIVE = "active",
  PENDING = "pending",
}

export const TimelineCard = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();

  const voteStatus = useMemo((): TimelineItemStatus => {
    if (proposal.status === ProposalStatus.UPCOMING || proposal.status === ProposalStatus.DRAFT)
      return TimelineItemStatus.PENDING;
    if (proposal.status === ProposalStatus.VOTING) return TimelineItemStatus.ACTIVE;
    return TimelineItemStatus.COMPLETED;
  }, [proposal.status]);

  const finishedStatus = useMemo((): TimelineItemStatus => {
    return [ProposalStatus.DRAFT, ProposalStatus.UPCOMING, ProposalStatus.VOTING].includes(proposal.status)
      ? TimelineItemStatus.PENDING
      : TimelineItemStatus.COMPLETED;
  }, [proposal.status]);

  const timelineItems = useMemo(
    () => [
      {
        id: "created",
        label: LL.proposal.timeline_created(),
        date: proposal.createdAt,
        status: TimelineItemStatus.COMPLETED,
      },
      {
        id: "vote",
        label: LL.vote(),
        date: proposal.startDate,
        endDate: proposal.endDate,
        status: voteStatus,
      },
      {
        id: "finished",
        label: LL.finished(),
        date: proposal.endDate,
        status: finishedStatus,
      },
    ],
    [LL, proposal.createdAt, proposal.startDate, proposal.endDate, voteStatus, finishedStatus],
  );

  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}>
      <Flex flexDirection={"column"} gap={6} padding={{ base: "16px", md: "24px" }}>
        {/* Header */}
        <Flex alignItems={"center"} gap={3}>
          <Icon as={CalendarIcon} width={5} height={5} color={"primary.700"} />
          <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
            {LL.proposal.timeline()}
          </Text>
        </Flex>

        {/* Timeline items */}
        <Flex flexDirection={"column"} gap={2} paddingX={4}>
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={item.id}
              label={item.label}
              date={item.date}
              endDate={item.endDate}
              status={item.status}
              isLast={index === timelineItems.length - 1}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

interface TimelineItemProps {
  label: string;
  date?: Date;
  endDate?: Date;
  status: TimelineItemStatus;
  isLast?: boolean;
}

const TimelineItem = ({ label, date, endDate, status, isLast }: TimelineItemProps) => {
  const { formattedProposalDate } = useFormatDate();

  const statusColor = useMemo(() => {
    switch (status) {
      case TimelineItemStatus.COMPLETED:
        return "primary.500";
      case TimelineItemStatus.ACTIVE:
        return "primary.500";
      case TimelineItemStatus.PENDING:
        return "gray.600";
      default:
        return "gray.600";
    }
  }, [status]);

  const iconStyle = useMemo(() => {
    switch (status) {
      case TimelineItemStatus.COMPLETED:
        return {
          backgroundColor: "primary.500",
          border: "2px solid",
          borderColor: "primary.500",
        };
      case TimelineItemStatus.ACTIVE:
        return {
          backgroundColor: "white",
          border: "2px solid",
          borderColor: "primary.500",
        };
      case TimelineItemStatus.PENDING:
        return {
          backgroundColor: "white",
          border: "2px solid",
          borderColor: "gray.300",
        };
      default:
        return {
          backgroundColor: "gray.300",
          border: "2px solid",
          borderColor: "gray.300",
        };
    }
  }, [status]);

  return (
    <Flex alignItems={"center"} gap={4} width={"100%"}>
      {/* Timeline icon and line */}
      <Flex flexDirection={"column"} alignItems={"center"} width={"48px"} height={"48px"}>
        <Flex
          width={"20px"}
          height={"20px"}
          borderRadius={"full"}
          {...iconStyle}
          alignItems={"center"}
          justifyContent={"center"}>
          {status === TimelineItemStatus.COMPLETED && (
            <Flex width={"8px"} height={"8px"} backgroundColor={"white"} borderRadius={"full"} />
          )}
          {status === TimelineItemStatus.ACTIVE && (
            <Flex width={"8px"} height={"8px"} backgroundColor={"primary.500"} borderRadius={"full"} />
          )}
        </Flex>
        {!isLast && <Flex width={"2px"} height={"28px"} backgroundColor={"gray.200"} marginTop={1} />}
      </Flex>

      {/* Content */}
      <Flex flexDirection={"column"} gap={0.5} flex={1}>
        <Text fontSize={"14px"} fontWeight={600} color={statusColor}>
          {label}
        </Text>
        <Text fontSize={"14px"} color={"gray.500"}>
          {date && endDate
            ? `${formattedProposalDate(date)} - ${formattedProposalDate(endDate)}`
            : formattedProposalDate(date)}
        </Text>
      </Flex>
    </Flex>
  );
};
