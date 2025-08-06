import { Button, defineStyle, Icon, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";
import { CloseIcon, SearchIcon } from "@/icons";

type SearchInputProps = InputProps & {
  onClear?: () => void;
};

const buttonStyle = defineStyle({
  position: "absolute",
  right: "0",
  top: "50%",
  transform: "translateY(-50%)",
  bottom: "0",
  variant: "ghost",
  minWidth: "40px",
  _focus: { boxShadow: "none" },
  backgroundColor: "white",
  padding: 0,
  paddingX: 2,
} as const);

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ onClear, value, ...props }, ref) => {
  return (
    <InputWithIcon backgroundColor={"white"} position={"relative"} flex={1} minWidth="0">
      <InputWithIcon.Icon iconPosition="left">
        <Icon as={SearchIcon} width={4} height={4} />
      </InputWithIcon.Icon>
      <InputWithIcon.Input
        paddingInlineEnd={0}
        minWidth="0"
        ref={ref}
        paddingLeft={0}
        value={value}
        size={{ base: "none", md: "md" }}
        {...props}
      />
      {value && onClear && (
        <Button {...buttonStyle} _hover={{ bg: "white" }} onClick={onClear} size={{ base: "sm", md: "md" }}>
          <Icon as={CloseIcon} width={4} height={4} />
        </Button>
      )}
    </InputWithIcon>
  );
});

SearchInput.displayName = "SearchInput";
