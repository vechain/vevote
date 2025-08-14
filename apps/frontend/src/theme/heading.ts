import { defineStyle, theme } from "@chakra-ui/react";

export const headingStyle = defineStyle({
  ...theme.components.Heading,
  baseStyle: {
    ...theme.components.Heading.baseStyle,
    fontFamily: "heading",
  },
});
