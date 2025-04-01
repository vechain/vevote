import { menuAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(parts.keys);

const primaryStyle = definePartsStyle({
  button: {
    bg: "gray.50",
    color: "gray.600",
    borderColor: "gray.200",
    _hover: {
      bg: "gray.100",
    },
  },
  list: {
    paddingY: "12px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderColor: "gray.200",
    boxShadow: "0px 0px 10px 0px gray.600",
  },
  item: {
    color: "gray.600",
    paddingX: "16px",
    paddingY: "12px",
    _hover: {
      bg: "gray.100",
    },
    _checked: {
      color: "primary.600",
      fontWeight: "500",
    },
  },
});

export const dropdownTheme = defineMultiStyleConfig({
  variants: {
    primary: primaryStyle,
  },
  defaultProps: {
    variant: "primary",
  },
});
