import { ChangeEvent, useState, useRef } from "react";
import {
  Box,
  Input,
  InputProps,
  VStack,
  HStack,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Grid,
  GridItem,
  Text,
  IconButton,
  useDisclosure,
  Icon,
  Portal,
} from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { useI18nContext } from "@/i18n/i18n-react";
import dayjs from "dayjs";

type CustomDatePickerProps = {
  value?: string;
  onChange?: InputProps["onChange"];
  isDisabled?: boolean;
} & Omit<InputProps, "value" | "onChange">;

export const CustomDatePicker = ({ value, onChange, isDisabled, ...inputProps }: CustomDatePickerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const { LL } = useI18nContext();

  const [selectedDate, setSelectedDate] = useState(() => {
    return value && dayjs(value).isValid() ? dayjs(value) : null;
  });

  const [viewDate, setViewDate] = useState(() => {
    return selectedDate || dayjs();
  });

  const displayValue = selectedDate ? selectedDate.format("DD/MM/YYYY") : "";

  const MONTHS = [
    LL.datepicker.months.january(),
    LL.datepicker.months.february(),
    LL.datepicker.months.march(),
    LL.datepicker.months.april(),
    LL.datepicker.months.may(),
    LL.datepicker.months.june(),
    LL.datepicker.months.july(),
    LL.datepicker.months.august(),
    LL.datepicker.months.september(),
    LL.datepicker.months.october(),
    LL.datepicker.months.november(),
    LL.datepicker.months.december(),
  ];

  const WEEKDAYS = [
    LL.datepicker.weekdays.mon(),
    LL.datepicker.weekdays.tue(),
    LL.datepicker.weekdays.wed(),
    LL.datepicker.weekdays.thu(),
    LL.datepicker.weekdays.fri(),
    LL.datepicker.weekdays.sat(),
    LL.datepicker.weekdays.sun(),
  ];

  const handleDateSelect = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    const dateString = date.format("YYYY-MM-DD");
    const mockEvent = {
      target: { value: dateString },
      currentTarget: { value: dateString },
    } as ChangeEvent<HTMLInputElement>;
    onChange?.(mockEvent);
    onClose();
  };

  const handleTodaySelect = () => {
    const today = dayjs();
    setSelectedDate(today);
    setViewDate(today);
    handleDateSelect(today);
  };

  const handlePrevMonth = () => {
    setViewDate(viewDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setViewDate(viewDate.add(1, "month"));
  };

  const getDaysInMonth = () => {
    const startOfMonth = viewDate.startOf("month");
    const endOfMonth = viewDate.endOf("month");
    const daysInMonth = endOfMonth.date();
    const startWeekday = startOfMonth.day() === 0 ? 7 : startOfMonth.day(); // Make Sunday = 7

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 1; i < startWeekday; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(startOfMonth.date(day));
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start" isLazy>
      <PopoverTrigger>
        <Box>
          <Input
            ref={inputRef}
            value={displayValue}
            placeholder={LL.datepicker.select_date()}
            onClick={onOpen}
            readOnly
            cursor="pointer"
            isDisabled={isDisabled}
            border="none"
            _focus={{ boxShadow: "none" }}
            _focusVisible={{ boxShadow: "none" }}
            paddingLeft={0}
            {...inputProps}
          />
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          width="300px"
          zIndex={9999}
          border="1px"
          borderColor="gray.200"
          boxShadow="0px 8px 24px rgba(0, 0, 0, 0.12)"
          borderRadius="12px">
          <PopoverBody p={5}>
            <VStack spacing={3}>
              {/* Header con mese/anno e frecce */}
              <HStack justify="space-between" width="100%" align="center">
                <IconButton
                  aria-label={LL.datepicker.previous_month()}
                  icon={<Icon as={ArrowLeftIcon} />}
                  size="sm"
                  variant="secondary"
                  onClick={handlePrevMonth}
                  borderRadius="6px"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                />
                <Text fontSize="md" fontWeight="600" color="gray.700" fontFamily="heading">
                  {MONTHS[viewDate.month()]} {viewDate.year()}
                </Text>
                <IconButton
                  aria-label={LL.datepicker.next_month()}
                  icon={<Icon as={ArrowRightIcon} />}
                  size="sm"
                  variant="secondary"
                  onClick={handleNextMonth}
                  borderRadius="6px"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                />
              </HStack>

              {/* Giorni della settimana */}
              <Grid templateColumns="repeat(7, 1fr)" gap={1} width="100%">
                {WEEKDAYS.map(weekday => (
                  <GridItem key={weekday}>
                    <Text fontSize="2xs" color="gray.500" textAlign="center" fontWeight="500" py={1}>
                      {weekday}
                    </Text>
                  </GridItem>
                ))}
              </Grid>

              {/* Griglia dei giorni */}
              <Grid templateColumns="repeat(7, 1fr)" gap={1} width="100%">
                {days.map((day, index) => (
                  <GridItem key={index}>
                    {day ? (
                      <Button
                        size="sm"
                        variant={selectedDate && day.isSame(selectedDate, "day") ? "primary" : "ghost"}
                        onClick={() => handleDateSelect(day)}
                        width="32px"
                        height="32px"
                        minWidth="32px"
                        fontSize="xs"
                        fontWeight="500"
                        borderRadius="6px"
                        bg={selectedDate && day.isSame(selectedDate, "day") ? "primary.500" : "transparent"}
                        color={selectedDate && day.isSame(selectedDate, "day") ? "white" : "gray.700"}
                        _hover={{
                          bg: selectedDate && day.isSame(selectedDate, "day") ? "primary.400" : "gray.50",
                        }}
                        _active={{
                          bg: selectedDate && day.isSame(selectedDate, "day") ? "primary.600" : "gray.100",
                        }}>
                        {day.date()}
                      </Button>
                    ) : (
                      <Box height="32px" width="32px" />
                    )}
                  </GridItem>
                ))}
              </Grid>

              {/* Today Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTodaySelect}
                width="100%"
                fontSize="xs"
                fontWeight="500"
                borderRadius="6px">
                {LL.datepicker.today()}
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
