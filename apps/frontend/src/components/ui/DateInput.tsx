import { Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { CalendarIcon } from "@/icons";
import { CustomDatePicker } from "./CustomDatePicker";

export const DateInput = (props: InputProps) => {
  return (
    <InputWithIcon flex={1} borderWidth="0px">
      <InputWithIcon.Icon iconPosition="left">
        <Icon as={CalendarIcon} width={4} height={4} color={"gray.500"} />
      </InputWithIcon.Icon>
      <CustomDatePicker
        value={props.defaultValue as string}
        onChange={props.onChange}
        isDisabled={props.isDisabled}
      />
    </InputWithIcon>
  );
};
