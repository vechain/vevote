import { ChangeEvent, useMemo, useState, useRef } from "react";
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
  Text,
  useDisclosure,
  Portal,
} from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type CustomTimePickerProps = {
  value?: string;
  onChange?: InputProps["onChange"];
  isDisabled?: boolean;
} & Omit<InputProps, "value" | "onChange">;

export const CustomTimePicker = ({ value, onChange, isDisabled, ...inputProps }: CustomTimePickerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const { LL } = useI18nContext();

  const [selectedTime, setSelectedTime] = useState(() => {
    if (value && dayjs.utc(`2000-01-01T${value}`).isValid()) {
      return dayjs.utc(`2000-01-01T${value}`);
    }
    return null;
  });

  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string | null>(null);

  const displayValue = useMemo(() => (selectedTime ? selectedTime.format("HH:mm") + " UTC" : ""), [selectedTime]);

  const hours = useMemo(() => {
    const hoursArray = [];
    for (let i = 0; i < 24; i++) {
      hoursArray.push(i.toString().padStart(2, "0"));
    }
    return hoursArray;
  }, []);

  const minutes = useMemo(() => {
    const minutesArray = [];
    for (let i = 0; i < 60; i += 15) {
      minutesArray.push(i.toString().padStart(2, "0"));
    }
    return minutesArray;
  }, []);

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      completeTimeSelection(hour, selectedMinute);
    }
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      completeTimeSelection(selectedHour, minute);
    }
  };

  const completeTimeSelection = (hour: string, minute: string) => {
    const timeString = `${hour}:${minute}`;
    const time = dayjs.utc(`2000-01-01T${timeString}`);
    setSelectedTime(time);

    const mockEvent = {
      target: { value: timeString },
      currentTarget: { value: timeString },
    } as ChangeEvent<HTMLInputElement>;
    onChange?.(mockEvent);
    onClose();
  };

  const getCurrentHour = () => selectedHour || (selectedTime ? selectedTime.format("HH") : null);
  const getCurrentMinute = () => selectedMinute || (selectedTime ? selectedTime.format("mm") : null);

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start" isLazy>
      <PopoverTrigger>
        <Box>
          <Input
            ref={inputRef}
            value={displayValue}
            placeholder={LL.timepicker.select_time()}
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
          width="260px"
          zIndex={9999}
          border="1px"
          borderColor="gray.200"
          boxShadow="0px 8px 24px rgba(0, 0, 0, 0.12)"
          borderRadius="12px">
          <PopoverBody p={5}>
            <VStack spacing={4}>
              <VStack spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="heading">
                  {LL.timepicker.select_time_24h()}
                </Text>
                <Text
                  fontSize="2xs"
                  color="primary.600"
                  fontWeight="500"
                  bg="primary.50"
                  px={2}
                  py={1}
                  borderRadius="4px">
                  {LL.timepicker.utc_notice()}
                </Text>
              </VStack>

              <HStack spacing={4} width="100%">
                {/* Ore */}
                <VStack spacing={2} flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.600">
                    {LL.timepicker.hours()}
                  </Text>
                  <Box
                    height="120px"
                    overflowY="auto"
                    width="100%"
                    borderRadius="6px"
                    border="1px"
                    borderColor="gray.100"
                    p={1}>
                    <VStack spacing={0.5}>
                      {hours.map(hour => (
                        <Button
                          key={hour}
                          size="sm"
                          onClick={() => handleHourSelect(hour)}
                          width="100%"
                          fontSize="xs"
                          fontWeight="500"
                          borderRadius="4px"
                          bg={getCurrentHour() === hour ? "primary.500" : "transparent"}
                          color={getCurrentHour() === hour ? "white" : "gray.700"}
                          _hover={{
                            bg: getCurrentHour() === hour ? "primary.400" : "gray.50",
                          }}
                          _active={{
                            bg: getCurrentHour() === hour ? "primary.600" : "gray.100",
                          }}>
                          {hour}
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                </VStack>

                <VStack spacing={2} flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.600">
                    {LL.timepicker.minutes()}
                  </Text>
                  <Box
                    height="120px"
                    overflowY="auto"
                    width="100%"
                    borderRadius="6px"
                    border="1px"
                    borderColor="gray.100"
                    p={1}>
                    <VStack spacing={0.5}>
                      {minutes.map(minute => (
                        <Button
                          key={minute}
                          size="sm"
                          onClick={() => handleMinuteSelect(minute)}
                          width="100%"
                          fontSize="xs"
                          fontWeight="500"
                          borderRadius="4px"
                          bg={getCurrentMinute() === minute ? "primary.500" : "transparent"}
                          color={getCurrentMinute() === minute ? "white" : "gray.700"}
                          _hover={{
                            bg: getCurrentMinute() === minute ? "primary.400" : "gray.50",
                          }}
                          _active={{
                            bg: getCurrentMinute() === minute ? "primary.600" : "gray.100",
                          }}>
                          {minute}
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </HStack>

              <Box
                p={3}
                bg="primary.50"
                border="1px"
                borderColor="primary.200"
                borderRadius="8px"
                width="100%"
                textAlign="center">
                <Text fontSize="md" fontWeight="700" color="primary.600" fontFamily="heading">
                  {selectedHour && selectedMinute
                    ? `${selectedHour}:${selectedMinute} UTC`
                    : displayValue || "--:-- UTC"}
                </Text>
              </Box>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
