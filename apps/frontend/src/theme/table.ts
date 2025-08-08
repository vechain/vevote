import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys);

const baseStyle = definePartsStyle({
  table: {
    fontFamily: "Inter, sans-serif",
    tableLayout: { md: "fixed" },
    width: "100%",
  },
  thead: {
    backgroundColor: "gray.100",
  },
});

const sizes = {
  default: definePartsStyle({
    th: {
      letterSpacing: "default",
      paddingInlineStart: 2,
      paddingInlineEnd: 2,
      px: 2,
      py: 2,
      lineHeight: 4,
    },
    td: {
      paddingInlineStart: 2,
      paddingInlineEnd: 2,
      px: 2,
      py: 2,
      lineHeight: 4,
    },
  }),
};

export const tableTheme = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: "default",
  },
});
