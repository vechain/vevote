import { Button, defineStyle, Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";
import { MinusIcon, PlusIcon } from "@/icons";

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
          <Icon as={MinusIcon} />
        </Button>
        <InputWithIcon.Input ref={ref} borderWidth={"0"} textAlign={"center"} type="number" flex={1} {...props} />
        <Button isDisabled={isMaxDisable} {...buttonStyle} onClick={onIncrement}>
          <Icon as={PlusIcon} />
        </Button>
      </InputWithIcon>
    );
  },
);

InputIncrement.displayName = "InputIncrement";
