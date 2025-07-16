import { Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { CalendarIcon } from "@/icons";

export const DateInput = (props: InputProps) => {
  return (
    <InputWithIcon flex={1}>
      <InputWithIcon.Icon iconPosition="left">
        <Icon as={CalendarIcon} width={4} height={4} color={"gray.500"} />
      </InputWithIcon.Icon>
      <InputWithIcon.Input
        {...props}
        paddingLeft={"0px"}
        type={"date"}
        justifyContent={"center"}
        maxWidth={{ base: "100px", md: "full" }}
      />
    </InputWithIcon>
  );
};
