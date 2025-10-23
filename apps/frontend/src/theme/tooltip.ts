import { cssVar, defineStyle, defineStyleConfig } from "@chakra-ui/react";

const $arrowBg = cssVar("popper-arrow-bg");

const baseStyle = defineStyle({
  backgroundColor: "gray.900",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "14px",
  color: "white",
  zIndex: "tooltip",
  [$arrowBg.variable]: "#171923",
});

export const tooltipTheme = defineStyleConfig({
  baseStyle,
});
