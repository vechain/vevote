import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { tabsAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys);

const defaultVariant = definePartsStyle({
  tab: {
    fontSize: "14px",
    borderRadius: "4px",
    color: "primary.600",
    _selected: {
      backgroundColor: "primary.100",
    },
  },
  tablist: {
    backgroundColor: "white",
    width: "fit-content",
    borderWidth: "1px",
    borderColor: "gray.200",
    borderRadius: "8px",
    padding: "4px",
  },
});

const sizes = {
  sm: {
    tab: {
      paddingX: "12px",
      paddingY: "4px",
    },
  },
  md: {
    tab: {
      paddingX: "16px",
      paddingY: "8px",
    },
  },
};

export const tabsTheme = defineMultiStyleConfig({
  baseStyle: {
    tab: {
      minWidth: "80px",
      height: "40px",
      fontSize: "14px",
      fontWeight: "500",
      color: "gray.600",
      _selected: {
        color: "primary.600",
      },
    },
  },
  variants: {
    default: defaultVariant,
  },
  sizes,
  defaultProps: { variant: "default", size: "md" },
});
