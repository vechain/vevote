import { useProposal } from "@/components/proposal/ProposalProvider";
import { ClockIcon } from "@/icons";
import { ProposalStatus } from "@/types/proposal";
import { Flex, Icon, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useI18nContext } from "@/i18n/i18n-react";

const CountdownBox = ({ value, label }: { value: number; label: string }) => {
  return (
    <Flex
      flexDirection={"column"}
      alignItems={"center"}
      backgroundColor={"gray.50"}
      padding={"8px 12px"}
      borderRadius={8}
      flex={1}>
      <Text fontWeight={600} fontSize={"16px"} color={"gray.600"}>
        {value}
      </Text>
      <Text fontWeight={500} fontSize={"12px"} color={"gray.600"}>
        {label}
      </Text>
    </Flex>
  );
};

const splitDateDifference = (date?: Date) => {
  if (!date) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  // Calculate the difference
  const now = dayjs();
  const target = dayjs(date);
  let diff = target.diff(now, "second");
  if (diff < 0) diff = 0;

  const secondsInDay = 24 * 60 * 60;
  const secondsInHour = 60 * 60;
  const secondsInMinute = 60;

  const days = Math.floor(diff / secondsInDay);
  const hours = Math.floor((diff % secondsInDay) / secondsInHour);
  const minutes = Math.floor((diff % secondsInHour) / secondsInMinute);
  const seconds = diff % secondsInMinute;

  return { days, hours, minutes, seconds };
};

export const CountdownSection = () => {
  const { LL } = useI18nContext();
  const [, setTime] = useState<number>(0);
  const { proposal } = useProposal();

  const isValidStatus = proposal.status === ProposalStatus.UPCOMING || proposal.status === ProposalStatus.VOTING;

  // simulate the countdown
  useEffect(() => {
    if (!isValidStatus) return;
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isValidStatus]);

  // if the voting has started reload the page
  useEffect(() => {
    if (proposal.status === ProposalStatus.UPCOMING) {
      const now = dayjs();
      const startDate = dayjs(proposal.startDate);
      if (startDate.isBefore(now)) {
        window.location.reload();
      }
    }
  }, [proposal.startDate, proposal.status]);

  const label = useMemo(
    () => (proposal.status === ProposalStatus.UPCOMING ? LL.proposal.starts_in() : LL.proposal.ends_in()),
    [proposal.status, LL],
  );
  const date = useMemo(
    () => (proposal.status === ProposalStatus.UPCOMING ? proposal.startDate : proposal.endDate),
    [proposal.status, proposal.startDate, proposal.endDate],
  );

  const { days, hours, minutes, seconds } = splitDateDifference(date);

  if (!isValidStatus) return null;

  return (
    <Flex
      flexDirection={"column"}
      gap={4}
      padding={{ base: "16px", md: "24px" }}
      borderBottom={"1px solid"}
      borderColor={"gray.200"}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Flex alignItems={"center"} gap={3}>
          <Icon as={ClockIcon} width={5} height={5} color={"primary.700"} />
          <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
            {label}
          </Text>
        </Flex>
      </Flex>

      <Flex gap={2} justifyContent={"space-between"}>
        <CountdownBox value={days} label="days" />
        <CountdownBox value={hours} label="hours" />
        <CountdownBox value={minutes} label="minutes" />
        <CountdownBox value={seconds} label="seconds" />
      </Flex>
    </Flex>
  );
};
