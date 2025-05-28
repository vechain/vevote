import { defineStyleConfig } from "@chakra-ui/react";

export const iconTheme = defineStyleConfig({
  baseStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "gray.500",
  },
  sizes: {
    xs: {
      width: "16px",
      height: "16px",
    },
    sm: {
      width: "20px",
      height: "20px",
    },
    md: {
      width: "1.5rem",
      height: "1.5rem",
    },
    lg: {
      width: "2rem",
      height: "2rem",
    },
    xl: {
      width: "4rem",
      height: "4rem",
    },
  },
  defaultProps: {
    variant: "default",
    size: "md",
  },
});
