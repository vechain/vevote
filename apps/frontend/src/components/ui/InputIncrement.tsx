import { Button, defineStyle, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";
import { GoPlus } from "react-icons/go";
import { LuMinus } from "react-icons/lu";

type InputIncrementProps = InputProps & {
  onIncrement: () => void;
  onDecrement: () => void;
  isMinDisable?: boolean;
  isMaxDisable?: boolean;
};

const buttonStyle = defineStyle({
  size: "fit",
  variant: "ghost",
  _focus: { boxShadow: "none" },
});

export const InputIncrement = forwardRef<HTMLInputElement, InputIncrementProps>(
  ({ onDecrement, onIncrement, isMaxDisable, isMinDisable, ...props }, ref) => {
    return (
      <InputWithIcon borderWidth={"1px"} paddingX={2} width={"180px"}>
        <Button isDisabled={isMinDisable} {...buttonStyle} onClick={onDecrement}>
          <LuMinus size={24} />
        </Button>
        <InputWithIcon.Input ref={ref} borderWidth={"0"} textAlign={"center"} type="number" flex={1} {...props} />
        <Button isDisabled={isMaxDisable} {...buttonStyle} onClick={onIncrement}>
          <GoPlus size={24} />
        </Button>
      </InputWithIcon>
    );
  },
);

InputIncrement.displayName = "InputIncrement";
