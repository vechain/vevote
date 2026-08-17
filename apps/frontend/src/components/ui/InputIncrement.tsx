import { Button, defineStyle, Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";
import { MinusIcon, PlusIcon } from "@/icons";
import { useI18nContext } from "@/i18n/i18n-react";

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
    const { LL } = useI18nContext();

    return (
      <InputWithIcon
        borderWidth={"1px"}
        transition={"width 0.2s ease-in-out "}
        paddingX={2}
        width={{ base: "full", sm: "180px" }}>
        <Button aria-label={LL.input.decrement()} isDisabled={isMinDisable} {...buttonStyle} onClick={onDecrement}>
          <Icon as={MinusIcon} aria-hidden />
        </Button>
        <InputWithIcon.Input ref={ref} borderWidth={"0"} textAlign={"center"} type="number" flex={1} {...props} />
        <Button aria-label={LL.input.increment()} isDisabled={isMaxDisable} {...buttonStyle} onClick={onIncrement}>
          <Icon as={PlusIcon} aria-hidden />
        </Button>
      </InputWithIcon>
    );
  },
);

InputIncrement.displayName = "InputIncrement";
