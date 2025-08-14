import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

export const baseStyle = defineStyle({
  fontFamily: "body",
  fontSize: "0.875rem",
});

export const linkTheme = defineStyleConfig({
  baseStyle,
});
