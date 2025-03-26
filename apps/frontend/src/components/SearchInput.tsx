import { Button, defineStyle, Icon, InputProps } from "@chakra-ui/react";
import { IoIosClose, IoIosSearch } from "react-icons/io";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";

type SearchInputProps = InputProps & {
  onClear?: () => void;
};

const buttonStyle = defineStyle({
  variant: "ghost",
  minWidth: "40px",
  _focus: { boxShadow: "none" },
  backgroundColor: "white",
  padding: 0,
  paddingX: 2,
} as const);

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ onClear, value, ...props }, ref) => {
  return (
    <InputWithIcon backgroundColor={"white"} width={"222px"}>
      <InputWithIcon.Icon iconPosition="left" as={IoIosSearch} size={"md"} />
      <InputWithIcon.Input ref={ref} paddingLeft={0} value={value} {...props} />
      {value && onClear && (
        <Button {...buttonStyle} onClick={onClear}>
          <Icon size={"md"} as={IoIosClose} />
        </Button>
      )}
    </InputWithIcon>
  );
});

SearchInput.displayName = "SearchInput";
