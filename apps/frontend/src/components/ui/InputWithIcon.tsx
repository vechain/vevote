import {
  Input,
  InputAddonProps,
  InputGroup,
  InputGroupProps,
  InputLeftAddon,
  InputProps,
  InputRightAddon,
} from "@chakra-ui/react";
import { forwardRef } from "react";

const InputWithIcon = (props: InputGroupProps) => {
  return (
    <InputGroup
      borderRadius={"12px"}
      borderWidth={"1px"}
      borderColor={"gray.200"}
      _groupInvalid={{ borderColor: "red.500", borderWidth: "2px", boxShadow: "none" }}
      alignItems={"center"}
      backgroundColor={"white"}
      h={{ base: "40px", md: "48px" }}
      overflow={"hidden"}
      {...props}
    />
  );
};

const InputWithIconIcon = ({
  iconPosition = "left",
  ...props
}: InputAddonProps & {
  iconPosition: "left" | "right";
}) => {
  if (iconPosition === "left") {
    return <InputLeftAddon borderWidth={"0"} _groupInvalid={{ borderWidth: "0px", boxShadow: "none" }} {...props} />;
  }
  return <InputRightAddon borderWidth={"0"} _groupInvalid={{ borderWidth: "0px", boxShadow: "none" }} {...props} />;
};

const InputWithIconInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      _focusWithin={{ boxShadow: "none" }}
      _groupInvalid={{ borderWidth: "0px", boxShadow: "none" }}
      justifyContent={"center"}
      borderWidth={"0px"}
      {...props}
    />
  );
});

InputWithIconInput.displayName = "InputWithIconInput";

InputWithIcon.Icon = InputWithIconIcon;
InputWithIcon.Input = InputWithIconInput;

export { InputWithIcon };
