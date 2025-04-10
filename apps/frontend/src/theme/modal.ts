import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { modalAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(modalAnatomy.keys);

const resetModalItemsStyle = {
  color: { color: "primary.900" },
  padding: { padding: "0" },
};

const defaultVariant = definePartsStyle({
  dialog: {
    bg: "white",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    boxShadow: "0px 2px 6px 0px rgba(0, 0, 0, 0.07)",
  },
  overlay: {
    backdropFilter: "blur(15px)",
    background: "rgba(23, 13, 69, 0.65)",
  },
  header: {
    fontSize: "30px",
    fontWeight: "600",
    color: "primary.500",
  },
  closeButton: resetModalItemsStyle.color,
  body: resetModalItemsStyle.color,
  footer: resetModalItemsStyle.color,
});

export const modalTheme = defineMultiStyleConfig({
  variants: { default: defaultVariant },
  sizes: {
    default: {
      dialog: {
        padding: "40px",
        maxWidth: "480px",
      },
      header: resetModalItemsStyle.padding,
      body: resetModalItemsStyle.padding,
      footer: resetModalItemsStyle.padding,
    },
  },
  defaultProps: { variant: "default", size: "default" },
});
