import { radioAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(radioAnatomy.keys);

const baseStyle = definePartsStyle({
  control: {
    borderColor: "gray.500",
    _checked: {
      borderColor: "primary.500",
      backgroundColor: "primary.500",
    },
    width: { base: "16px", md: "20px" },
    height: { base: "16px", md: "20px" },
  },
});

export const radioTheme = defineMultiStyleConfig({ baseStyle });
