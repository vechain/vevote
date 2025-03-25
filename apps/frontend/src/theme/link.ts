import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

export const baseStyle = defineStyle({
  fontFamily: "Inter, sans-serif",
  fontSize: "0.875rem",
});

export const linkTheme = defineStyleConfig({
  baseStyle,
});
