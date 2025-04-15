import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";
import { inputAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys);

export const paddingInput = defineStyle({
  paddingX: "16px",
  paddingY: "8px",
});

const smallInput = defineStyle({
  width: "222px",
  height: "40px",
  ...paddingInput,
});

const mediumInput = defineStyle({
  width: "288px",
  height: "48px",
  ...paddingInput,
});

const fullInput = defineStyle({
  width: "100%",
  height: "48px",
  ...paddingInput,
});

const fitInput = defineStyle({
  maxWidth: "fit-content",
  height: "48px",
  ...paddingInput,
});

export const commonInputSizes = {
  sm: smallInput,
  md: mediumInput,
  full: fullInput,
  fit: fitInput,
};

export const commonInputStyle = defineStyle({
  bg: "white",
  color: "gray.600",
  borderWidth: "1px",
  borderRadius: "8px",
  borderColor: "gray.200",
  _groupInvalid: {
    borderColor: "red.500",
    borderWidth: "2px",
    boxShadow: "none",
  },
  _disabled: {
    cursor: "not-allowed",
  },
});

const baseStyle = definePartsStyle({
  field: commonInputStyle,
  addon: {
    bg: "white",
    color: "gray.600",
    borderWidth: "1px",
    borderRightWidth: "0px",
    borderRadius: "8px",
    borderColor: "gray.200",
  },
});

const addonInput = defineStyle({
  paddingX: "10px",
  paddingY: "12px",
});

export const inputTheme = defineMultiStyleConfig({
  baseStyle: baseStyle,
  sizes: {
    sm: {
      field: commonInputSizes.sm,
      addon: addonInput,
    },
    md: {
      field: commonInputSizes.md,
      addon: addonInput,
    },
    full: {
      field: commonInputSizes.full,
      addon: addonInput,
    },
    fit: {
      field: commonInputSizes.fit,
      addon: addonInput,
    },
  },
  defaultProps: { variant: "default", size: "md" },
});
