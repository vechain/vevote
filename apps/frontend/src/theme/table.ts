import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys);

const baseStyle = definePartsStyle({
  table: {
    fontFamily: "Inter, sans-serif",
  },
  thead: {
    backgroundColor: "gray.100",
  },
});

const sizes = {
  default: definePartsStyle({
    th: {
      paddingInlineStart: 3,
      paddingInlineEnd: 3,
      px: 2,
      py: 2,
      lineHeight: 4,
    },
    td: {
      paddingInlineStart: 3,
      paddingInlineEnd: 3,
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
