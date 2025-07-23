import { FileUploadChild } from "@/components/ui/FileUploadChild";
import { useI18nContext } from "@/i18n/i18n-react";
import { ZodFile } from "@/utils/zod";
import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";
import dayjs from "dayjs";
import { VotingChoices } from "@/types/proposal";
import { getTimeZone } from "@/utils/timezone";
import { ArrowDownIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from "@/icons";

const SummaryCard = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <Flex
      width={"full"}
      padding={{ base: 4, md: 6 }}
      borderRadius={24}
      flexDirection={"column"}
      alignItems={"start"}
      gap={{ base: 4, md: 6 }}
      backgroundColor={"gray.100"}>
      <Heading fontSize={{ base: 16, md: 20 }} fontWeight={600} color={"gray.600"}>
        {title}
      </Heading>
      <Flex
        width={"full"}
        padding={{ base: 6, md: 10 }}
        borderRadius={12}
        alignItems={"start"}
        flexDirection={"column"}
        gap={6}
        backgroundColor={"white"}>
        {children}
      </Flex>
    </Flex>
  );
};

const BaseItem = ({ label, value, lineClamp }: { label: string; value: string; lineClamp?: number }) => {
  return (
    <Flex gap={{ base: 3, md: 0 }} flexDirection={{ base: "column", md: "row" }} width={"full"}>
      <Text
        width={{ base: "full", md: "25%" }}
        pr={3}
        fontSize={{ base: 14, md: 16 }}
        fontWeight={500}
        color={"gray.800"}>
        {label}
      </Text>

      <Text
        fontSize={{ base: 14, md: 16 }}
        color={"gray.600"}
        width={{ base: "full", md: "75%" }}
        overflow={"hidden"}
        textOverflow={"ellipsis"}
        whiteSpace={lineClamp ? "wrap" : "nowrap"}
        noOfLines={lineClamp}>
        {value}
      </Text>
    </Flex>
  );
};

const ImageItem = ({ label, value }: { label: string; value?: ZodFile }) => {
  return (
    <Flex gap={{ base: 3, md: 0 }} flexDirection={{ base: "column", md: "row" }} width={"full"}>
      <Text
        width={{ base: "full", md: "25%" }}
        pr={3}
        fontSize={{ base: 14, md: 16 }}
        fontWeight={500}
        color={"gray.800"}>
        {label}
      </Text>

      <FileUploadChild value={value} />
    </Flex>
  );
};

const CalendarItem = ({ label, startDate, endDate }: { label: string; startDate?: Date; endDate?: Date }) => {
  const { LL } = useI18nContext();

  const timeZone = useMemo(() => {
    return getTimeZone();
  }, []);

  return (
    <Flex gap={{ base: 3, md: 0 }} flexDirection={{ base: "column", md: "row" }} width={"full"}>
      <Flex width={{ base: "full", md: "25%" }} pr={3} flexDirection={"column"}>
        <Text fontSize={{ base: 14, md: 16 }} fontWeight={500} color={"gray.800"}>
          {label}
        </Text>
        <Text paddingTop={2} color={"gray.600"} fontSize={14}>
          {timeZone}
        </Text>
      </Flex>
      <Flex flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "start", md: "center" }} gap={"24px"}>
        <ShowDetailsDateItemChild date={startDate} label={LL.start()} />
        <Icon hideBelow={"md"} as={ArrowRightIcon} />
        <Icon hideFrom={"md"} as={ArrowDownIcon} />
        <ShowDetailsDateItemChild date={endDate} label={LL.end()} />
      </Flex>
    </Flex>
  );
};

const ShowDetailsDateItemChild = ({ date, label }: { date?: Date; label: string }) => {
  const onlyDate = useMemo(() => dayjs(date).format("DD/MM/YYYY"), [date]);
  const onlyTime = useMemo(() => dayjs(date).format("hh:mm A"), [date]);
  return (
    <Flex
      flexDirection={"column"}
      gap={"8px"}
      width={"160px"}
      borderWidth={"1px"}
      borderColor={"gray.100"}
      padding={"16px"}
      borderRadius={"8px"}>
      <Text color={"gray.600"} fontWeight={"500"} fontSize={"14px"}>
        {label}
      </Text>
      <Flex alignItems={"center"} gap={"12px"}>
        <Icon as={CalendarIcon} color={"gray.400"} width={4} height={4} />
        <Text color={"gray.600"} fontSize={"14px"}>
          {onlyDate}
        </Text>
      </Flex>
      <Flex alignItems={"center"} gap={"12px"}>
        <Icon as={ClockIcon} color={"gray.400"} width={4} height={4} />
        <Text color={"gray.600"} fontSize={"14px"}>
          {onlyTime}
        </Text>
      </Flex>
    </Flex>
  );
};

type OptionsItemProps = {
  label: string;
  votingOptions: VotingChoices["votingOptions"];
};

const OptionsItem = ({ votingOptions, label }: OptionsItemProps) => {
  return (
    <Flex gap={{ base: 3, md: 0 }} flexDirection={{ base: "column", md: "row" }} width={"full"}>
      <Text
        width={{ base: "full", md: "25%" }}
        pr={3}
        fontSize={{ base: 14, md: 16 }}
        fontWeight={500}
        color={"gray.800"}>
        {label}
      </Text>

      {(
        <Text
          width={{ base: "full", md: "75%" }}
          fontSize={{ base: 14, md: 16 }}
          color={"gray.600"}
          overflow={"hidden"}
          textOverflow={"ellipsis"}
          whiteSpace={"nowrap"}>
          {votingOptions.join(" / ")}
        </Text>
      )}
    </Flex>
  );
};

SummaryCard.BaseItem = BaseItem;
SummaryCard.ImageItem = ImageItem;
SummaryCard.CalendarItem = CalendarItem;
SummaryCard.OptionsItem = OptionsItem;

export { SummaryCard };
