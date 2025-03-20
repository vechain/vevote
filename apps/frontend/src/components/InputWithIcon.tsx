import {
  Icon,
  Input,
  InputAddonProps,
  InputGroup,
  InputGroupProps,
  InputLeftAddon,
  InputProps,
  InputRightAddon,
} from "@chakra-ui/react";
import { As } from "@chakra-ui/system";
import { forwardRef } from "react";

const InputWithIcon = (props: InputGroupProps) => {
  return (
    <InputGroup
      width={"full"}
      borderRadius={"8px"}
      borderWidth={"1px"}
      borderColor={"gray.200"}
      _groupInvalid={{ borderColor: "red.500", borderWidth: "2px", boxShadow: "none" }}
      alignItems={"center"}
      backgroundColor={"white"}
      {...props}
    />
  );
};

const InputWithIconIcon = ({
  iconPosition = "left",
  as,
  size,
  ...props
}: InputAddonProps & {
  iconPosition: "left" | "right";
  as: As;
  size: "xs" | "sm" | "md" | "lg" | "xl";
}) => {
  if (iconPosition === "left") {
    return (
      <InputLeftAddon borderWidth={"0"} _groupInvalid={{ borderWidth: "0px", boxShadow: "none" }} {...props}>
        <Icon as={as} size={size} />
      </InputLeftAddon>
    );
  }
  return (
    <InputRightAddon borderWidth={"0"} _groupInvalid={{ borderWidth: "0px", boxShadow: "none" }} {...props}>
      <Icon as={as} size={size} />
    </InputRightAddon>
  );
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
