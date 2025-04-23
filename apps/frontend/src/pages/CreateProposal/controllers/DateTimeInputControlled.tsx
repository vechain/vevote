import { Flex, InputProps } from "@chakra-ui/react";
import dayjs from "dayjs";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";

type DateTimeInputProps<T extends FieldValues> = {
  name: Path<T>;
  isDisabled?: boolean;
  dateProps?: InputProps;
  timeProps?: InputProps;
};

export const DateTimeInputControlled = <T extends FieldValues>({
  dateProps,
  name,
  timeProps,
  isDisabled,
}: DateTimeInputProps<T>) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => {
        const date = dayjs(value ?? null).isValid() ? dayjs(value).format("YYYY-MM-DD") : undefined;
        const time = dayjs(value ?? null).isValid() ? dayjs(value).format("HH:mm") : "00:00";
        return (
          <Flex gap={"16px"}>
            <DateInput
              {...dateProps}
              isDisabled={isDisabled}
              defaultValue={date}
              onChange={v => {
                onChange(dayjs(`${v.currentTarget.value}T${time}`).toDate());
              }}
            />
            <TimeInput
              {...timeProps}
              isDisabled={isDisabled}
              defaultValue={time}
              onChange={v => {
                onChange(dayjs(`${date}T${v.currentTarget.value}`).toDate());
              }}
            />
          </Flex>
        );
      }}
    />
  );
};
