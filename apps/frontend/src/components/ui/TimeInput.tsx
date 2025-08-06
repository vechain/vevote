import { Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { ClockIcon } from "@/icons";
import { CustomTimePicker } from "./CustomTimePicker";

export const TimeInput = (props: InputProps) => {
  return (
    <InputWithIcon flex={1} borderWidth="0px">
      <InputWithIcon.Icon iconPosition="left">
        <Icon as={ClockIcon} width={4} height={4} color={"gray.500"} />
      </InputWithIcon.Icon>
      <CustomTimePicker
        value={props.defaultValue as string}
        onChange={props.onChange}
        isDisabled={props.isDisabled}
      />
    </InputWithIcon>
  );
};
