import { IconBadge } from "@/components/ui/IconBadge";
import { Status } from "@/components/ui/Status";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useI18nContext } from "@/i18n/i18n-react";
import { CalendarIcon, ChevronRightIcon, ClockIcon } from "@/icons";
import { ProposalCardType } from "@/types/proposal";
import { Flex, Icon, Link, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useHasVoted } from "@/hooks/useCastVote";

export const ProposalCard = ({ status, title, endDate, startDate, id }: ProposalCardType) => {
  const variant = useMemo(() => {
    switch (status) {
      case "min-not-reached":
        return "rejected";
      default:
        return status;
    }
  }, [status]);

  const { hasVoted } = useHasVoted({ proposalId: id });
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
        <Icon as={ChevronRightIcon} width={4} height={4} color={"gray.500"} />
      </Link>
    </Flex>
  );
};

const DateItem = ({ startDate, endDate, status }: Pick<ProposalCardType, "endDate" | "startDate" | "status">) => {
  const { LL } = useI18nContext();

  const { leftVotingDate, formattedDate } = useFormatDate();

  const votingDate = useMemo(() => leftVotingDate(endDate), [endDate, leftVotingDate]);

  const stringDate = useMemo(() => {
    switch (status) {
      case "upcoming":
        return formattedDate(startDate);
      default:
        return formattedDate(endDate);
    }
  }, [status, endDate, formattedDate, startDate]);

  const icon = useMemo(() => {
    switch (status) {
      case "voting":
        return ClockIcon;
      default:
        return CalendarIcon;
    }
  }, [status]);

  return (
    <Flex alignItems={"center"} gap={2}>
      <Icon as={icon} width={4} height={4} color={"gray.700"} />

      {status !== "voting" && (
        <>
          <Text color={"gray.400"} fontSize={16}>
            {status === "upcoming" ? LL.start() : LL.end()}
          </Text>

          <Text fontSize={16}>{stringDate}</Text>
        </>
      )}
      {status === "voting" && <VotingDate votingDate={votingDate} />}
    </Flex>
  );
};

export const VotingDate = ({
  votingDate,
}: {
  votingDate?: {
    days?: string;
    hours?: string;
    minutes?: string;
  };
}) => {
  const { LL } = useI18nContext();

  const hoursMinutes = useMemo(() => {
    if (votingDate?.hours) return `${votingDate?.hours} ${votingDate?.minutes}`;
    return `${votingDate?.minutes}`;
  }, [votingDate?.hours, votingDate?.minutes]);

  return (
    <Flex fontSize={16} alignItems={"center"} color={"gray.600"} gap={1}>
      {votingDate?.days && (
        <>
          <Text fontWeight={500}>{votingDate?.days}</Text>
          <Text color={"gray.500"}>{LL.and()}</Text>
        </>
      )}
      <Text fontWeight={500}>{hoursMinutes}</Text>
      <Text color={"gray.500"}>{LL.left().toLowerCase()}</Text>
    </Flex>
  );
};
