import { Button, defineStyle, Icon, InputGroupProps, InputProps } from "@chakra-ui/react";
import { InputWithIcon } from "./InputWithIcon";
import { forwardRef } from "react";
import { CloseIcon, SearchIcon } from "@/icons";
import { useI18nContext } from "@/i18n/i18n-react";

type SearchInputProps = InputProps & {
  onClear?: () => void;
  groupProps?: InputGroupProps;
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

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, value, groupProps, ...props }, ref) => {
    const { LL } = useI18nContext();

    return (
      <InputWithIcon backgroundColor={"white"} position={"relative"} flex={1} minWidth="0" {...groupProps}>
        <InputWithIcon.Icon iconPosition="left">
          <Icon as={SearchIcon} width={4} height={4} aria-hidden />
        </InputWithIcon.Icon>
        <InputWithIcon.Input
          type="search"
          aria-label={props["aria-label"] ?? props.placeholder ?? LL.search.label()}
          paddingInlineEnd={0}
          minWidth="0"
          ref={ref}
          paddingLeft={0}
          value={value}
          size={{ base: "none", md: "md" }}
          {...props}
        />
        {value && onClear && (
          <Button
            aria-label={LL.search.clear()}
            {...buttonStyle}
            _hover={{ bg: "white" }}
            onClick={onClear}
            size={{ base: "sm", md: "md" }}>
            <Icon as={CloseIcon} width={4} height={4} aria-hidden />
          </Button>
        )}
      </InputWithIcon>
    );
  },
);

SearchInput.displayName = "SearchInput";
