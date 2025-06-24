import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { tabsAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys);

const defaultVariant = definePartsStyle({
  tab: {
    whiteSpace: "nowrap",
    fontSize: { base: "12px", md: "14px" },
    borderRadius: "4px",
    color: "primary.600",
    _selected: {
      backgroundColor: "primary.100",
      color: "primary.600",
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
  tabpanel: {
    paddingX: 0,
    paddingTop: 12,
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
  variants: {
    default: defaultVariant,
  },
  sizes,
  defaultProps: { variant: "default", size: "md" },
});
