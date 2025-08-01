import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    padding: { base: "0 8px", md: "0 12px" },
    height: "32px",
    borderRadius: "8px",
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
    lineHeight: "24px",
    textTransform: "none",
    fontSize: { base: "12px", md: "14px" },
  },
});

const draft = definePartsStyle({
  container: {
    background: "gray.200",
    color: "gray.600",
  },
});

const upcoming = definePartsStyle({
  container: {
    background: "blue.100",
    color: "blue.700",
  },
});

const voting = definePartsStyle({
  container: {
    background: "green.100",
    color: "green.700",
  },
});

const approved = definePartsStyle({
  container: {
    background: "green.100",
    color: "green.700",
  },
});

const canceled = definePartsStyle({
  container: {
    background: "red.100",
    color: "red.700",
  },
});

export const tagTheme = defineMultiStyleConfig({
  baseStyle,
  variants: { draft, upcoming, voting, approved, canceled, rejected: canceled, executed: approved },
  defaultProps: {
    variant: "draft",
  },
});
