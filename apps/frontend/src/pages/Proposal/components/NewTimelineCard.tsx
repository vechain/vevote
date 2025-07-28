import { Flex, Text, Icon } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { CalendarIcon } from "@/icons";
import { useFormatDate } from "@/hooks/useFormatDate";

export const NewTimelineCard = () => {
  const { proposal } = useProposal();

  const getVoteStatus = (): "completed" | "active" | "pending" => {
    if (proposal.status === "upcoming") return "pending";
    if (proposal.status === "voting") return "active";
    return "completed";
  };

  const getFinishedStatus = (): "completed" | "pending" => {
    return ["approved", "rejected", "executed"].includes(proposal.status) ? "completed" : "pending";
  };

  const timelineItems = [
    {
      id: "created",
      label: "Created",
      date: proposal.createdAt,
      status: "completed" as const,
    },
    {
      id: "vote",
      label: "Vote",
      date: proposal.startDate,
      endDate: proposal.endDate,
      status: getVoteStatus(),
    },
    {
      id: "finished",
      label: "Finished",
      date: proposal.endDate,
      status: getFinishedStatus(),
    },
  ];

  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}
      minWidth={{ base: "auto", md: "480px" }}>
      <Flex flexDirection={"column"} gap={6} padding={{ base: "16px", md: "24px" }}>
        {/* Header */}
        <Flex alignItems={"center"} gap={3}>
          <Icon as={CalendarIcon} width={5} height={5} color={"primary.700"} />
          <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
            Timeline
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
  status: "completed" | "active" | "pending";
  isLast?: boolean;
}

const TimelineItem = ({ label, date, endDate, status, isLast }: TimelineItemProps) => {
  const { formattedProposalDate } = useFormatDate();

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "primary.500";
      case "active":
        return "primary.500";
      case "pending":
        return "gray.600";
      default:
        return "gray.600";
    }
  };

  const getIconStyle = () => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "primary.500",
          border: "2px solid",
          borderColor: "primary.500",
        };
      case "active":
        return {
          backgroundColor: "white",
          border: "2px solid",
          borderColor: "primary.500",
        };
      case "pending":
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
  };

  return (
    <Flex alignItems={"center"} gap={4} width={"100%"}>
      {/* Timeline icon and line */}
      <Flex flexDirection={"column"} alignItems={"center"} width={"48px"} height={"48px"}>
        <Flex
          width={"20px"}
          height={"20px"}
          borderRadius={"full"}
          {...getIconStyle()}
          alignItems={"center"}
          justifyContent={"center"}>
          {status === "completed" && (
            <Flex width={"8px"} height={"8px"} backgroundColor={"white"} borderRadius={"full"} />
          )}
          {status === "active" && (
            <Flex width={"8px"} height={"8px"} backgroundColor={"primary.500"} borderRadius={"full"} />
          )}
        </Flex>
        {!isLast && <Flex width={"2px"} height={"28px"} backgroundColor={"gray.200"} marginTop={1} />}
      </Flex>

      {/* Content */}
      <Flex flexDirection={"column"} gap={0.5} flex={1}>
        <Text fontSize={"14px"} fontWeight={600} color={getStatusColor()}>
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
