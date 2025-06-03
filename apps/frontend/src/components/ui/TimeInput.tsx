import { Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { ClockIcon } from "@/icons";

export const TimeInput = (props: InputProps) => {
  return (
    <InputWithIcon flex={1}>
      <InputWithIcon.Icon iconPosition="left">
        <Icon as={ClockIcon} width={4} height={4} color={"gray.500"} />
      </InputWithIcon.Icon>
      <InputWithIcon.Input {...props} size={"full"} paddingLeft={"0px"} type={"time"} justifyContent={"center"} />
    </InputWithIcon>
  );
};
