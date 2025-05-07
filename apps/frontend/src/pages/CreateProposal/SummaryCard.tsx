import { FileUploadChild } from "@/components/ui/FileUploadChild";
import { useI18nContext } from "@/i18n/i18n-react";
import { ZodFile } from "@/utils/zod";
import { Flex, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";
import { GoArrowRight } from "react-icons/go";
import { CiCalendar, CiClock1 } from "react-icons/ci";
import dayjs from "dayjs";
import { BaseOption, VotingChoices, VotingEnum } from "@/types/proposal";
import { getTimeZone } from "@/utils/timezone";

const SummaryCard = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <Flex
      width={"full"}
      padding={6}
      borderRadius={24}
      flexDirection={"column"}
      alignItems={"start"}
      gap={6}
      backgroundColor={"gray.100"}>
      <Heading fontSize={20} fontWeight={600} color={"gray.600"}>
        {title}
      </Heading>
      <Flex
        width={"full"}
        padding={10}
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
    <Grid gap={3} templateColumns="repeat(4, 1fr)" width={"full"}>
      <GridItem colSpan={1}>
        <Text fontWeight={500} color={"gray.800"}>
          {label}
        </Text>
      </GridItem>
      <GridItem colSpan={3}>
        <Text
          color={"gray.600"}
          width={"full"}
          overflow={"hidden"}
          textOverflow={"ellipsis"}
          whiteSpace={lineClamp ? "wrap" : "nowrap"}
          noOfLines={lineClamp}>
          {value}
        </Text>
      </GridItem>
    </Grid>
  );
};

const ImageItem = ({ label, value }: { label: string; value?: ZodFile }) => {
  return (
    <Grid gap={3} templateColumns="repeat(4, 1fr)" width={"full"}>
      <GridItem colSpan={1}>
        <Text fontWeight={500} color={"gray.800"}>
          {label}
        </Text>
      </GridItem>
      <GridItem colSpan={3}>
        <FileUploadChild value={value} />
      </GridItem>
    </Grid>
  );
};

const CalendarItem = ({ label, startDate, endDate }: { label: string; startDate?: Date; endDate?: Date }) => {
  const { LL } = useI18nContext();

  const timeZone = useMemo(() => {
    return getTimeZone();
  }, []);

  return (
    <Grid gap={3} templateColumns="repeat(4, 1fr)" width={"full"}>
      <GridItem colSpan={1}>
        <Text fontWeight={500} color={"gray.800"}>
          {label}
        </Text>
        <Text paddingTop={2} color={"gray.600"} fontSize={14}>
          {timeZone}
        </Text>
      </GridItem>
      <GridItem colSpan={3} display={"flex"} alignItems={"center"} gap={"24px"}>
        <ShowDetailsDateItemChild date={startDate} label={LL.start()} />
        <GoArrowRight />
        <ShowDetailsDateItemChild date={endDate} label={LL.end()} />
      </GridItem>
    </Grid>
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
        <CiCalendar color={"#AAAFB6"} />
        <Text color={"gray.600"} fontSize={"14px"}>
          {onlyDate}
        </Text>
      </Flex>
      <Flex alignItems={"center"} gap={"12px"}>
        <CiClock1 color={"#AAAFB6"} />
        <Text color={"gray.600"} fontSize={"14px"}>
          {onlyTime}
        </Text>
      </Flex>
    </Flex>
  );
};

type OptionsItemProps = {
  label: string;
  votingType: VotingEnum;
  votingOptions: VotingChoices["votingOptions"];
};

const OptionsItem = ({ votingOptions, votingType, label }: OptionsItemProps) => {
  const { LL } = useI18nContext();
  return (
    <Grid gap={3} templateColumns="repeat(4, 1fr)" width={"full"}>
      <GridItem colSpan={1}>
        <Text fontWeight={500} color={"gray.800"}>
          {label}
        </Text>
      </GridItem>
      <GridItem colSpan={3}>
        {votingType === VotingEnum.SINGLE_CHOICE && (
          <Text color={"gray.600"} width={"full"} overflow={"hidden"} textOverflow={"ellipsis"} whiteSpace={"nowrap"}>
            {votingOptions.join(" / ")}
          </Text>
        )}
        {(votingType === VotingEnum.MULTIPLE_OPTIONS || votingType === VotingEnum.SINGLE_OPTION) &&
          (votingOptions as BaseOption[]).map((value, id) => {
            return (
              <Flex key={value.id} flexDirection={"column"} alignItems={"start"}>
                <Text color={"gray.500"} fontSize={14}>
                  {LL.number_option({ index: id + 1 })}
                </Text>
                <Text color={"gray.600"}>{value.value}</Text>
              </Flex>
            );
          })}
      </GridItem>
    </Grid>
  );
};

SummaryCard.BaseItem = BaseItem;
SummaryCard.ImageItem = ImageItem;
SummaryCard.CalendarItem = CalendarItem;
SummaryCard.OptionsItem = OptionsItem;

export { SummaryCard };
