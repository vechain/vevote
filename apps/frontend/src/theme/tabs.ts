import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { tabsAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys);

const defaultVariant = definePartsStyle({
  tab: {
    columnSpan: "1",
    whiteSpace: "nowrap",
    fontSize: { base: "12px", md: "14px" },
    fontWeight: 500,
    borderRadius: "4px",
    color: "primary.600",
    _selected: {
      backgroundColor: "primary.100",
      color: "primary.600",
    },
  },
  tablist: {
    overflowX: "auto",
    backgroundColor: "white",
    width: { base: "100%", md: "fit-content" },
    borderWidth: "1px",
    borderColor: "gray.200",
    borderRadius: "8px",
    padding: "4px",
    display: "grid",
    gridAutoFlow: "column",
    gap: "4px",
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
