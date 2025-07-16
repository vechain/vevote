import { checkboxAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const baseStyle = definePartsStyle({
  control: defineStyle({
    borderColor: "gray.500",
    _checked: {
      borderColor: "primary.500",
      backgroundColor: "primary.500",
    },
    width: { base: "16px", md: "20px" },
    height: { base: "16px", md: "20px" },
  }),
});

export const checkboxTheme = defineMultiStyleConfig({
  baseStyle,
});
