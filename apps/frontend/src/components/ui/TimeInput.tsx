import { InputProps } from "@chakra-ui/react";
import { CiClock1 } from "react-icons/ci";
import { InputWithIcon } from "./InputWithIcon";

export const TimeInput = (props: InputProps) => {
  return (
    <InputWithIcon flex={1}>
      <InputWithIcon.Icon iconPosition="left" as={CiClock1} size={"sm"} />
      <InputWithIcon.Input {...props} size={"full"} paddingLeft={"0px"} type={"time"} justifyContent={"center"} />
    </InputWithIcon>
  );
};
