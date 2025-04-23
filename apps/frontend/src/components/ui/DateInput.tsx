import { InputProps } from "@chakra-ui/react";
import { CiCalendar } from "react-icons/ci";
import { InputWithIcon } from "./InputWithIcon";

export const DateInput = (props: InputProps) => {
  return (
    <InputWithIcon flex={1}>
      <InputWithIcon.Icon iconPosition="left" as={CiCalendar} size={"sm"} />
      <InputWithIcon.Input {...props} size={"full"} paddingLeft={"0px"} type={"date"} justifyContent={"center"} />
    </InputWithIcon>
  );
};
