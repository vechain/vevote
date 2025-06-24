import { Button, defineStyle, Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";
import { CloseIcon, SearchIcon } from "@/icons";

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
    <InputWithIcon backgroundColor={"white"} maxWidth={{ base: "280px", md: "222px" }}>
      <InputWithIcon.Icon iconPosition="left">
        <Icon as={SearchIcon} width={4} height={4} />
      </InputWithIcon.Icon>
      <InputWithIcon.Input ref={ref} paddingLeft={0} value={value} {...props} />
      {value && onClear && (
        <Button {...buttonStyle} onClick={onClear}>
          <Icon as={CloseIcon} width={4} height={4} />
        </Button>
      )}
    </InputWithIcon>
  );
});

SearchInput.displayName = "SearchInput";
