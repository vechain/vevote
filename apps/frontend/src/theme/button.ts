import { defineStyleConfig } from "@chakra-ui/react";
import { colors } from ".";

export const buttonTheme = defineStyleConfig({
  baseStyle: {
    fontFamily: "body",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "auto",
    transitionDuration: "150ms",
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    _disabled: {
      pointerEvents: "none",
    },
    _focus: {
      boxShadow: " 0px 0px 0px 2px #63B3ED;",
    },
    fontWeight: 600,
  },
  sizes: {
    icon: {
      paddingX: "1rem",
      paddingY: "0.75rem",
      gap: "0.75rem",
      height: "3rem",
      minW: "1rem",
      borderRadius: "0.75rem",
      fontSize: "1rem",
      lineHeight: "1.5rem",
    },
    lg: {
      paddingX: "1rem",
      paddingY: "0.75rem",
      gap: "0.75rem",
      height: "3rem",
      minW: "7rem",
      borderRadius: "0.75rem",
      fontSize: "1rem",
      lineHeight: "1.5rem",
    },
    md: {
      paddingX: "0.75rem",
      paddingY: "0.5rem",
      gap: "0.75rem",
      height: "2.5rem",
      minW: "5.5rem",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
    },
    sm: {
      paddingX: "0.75rem",
      paddingY: "0.25rem",
      gap: "0.5rem",
      height: "2rem",
      minW: "4rem",
      borderRadius: "0.5rem",
      fontSize: "0.75rem",
      lineHeight: "1rem",
    },
  },
  variants: {
    primary: {
      backgroundColor: colors.primary[500],
      textColor: colors.gray[50],
      _hover: {
        backgroundColor: colors.primary[400],
        boxShadow: "0px 0px 12px 1px rgba(0, 0, 0, 0.06)",
      },
      _active: {
        backgroundColor: colors.primary[700],
      },
      _loading: {
        backgroundColor: colors.primary[700],
      },
      _disabled: {
        backgroundColor: colors.primary[100],
        textColor: colors.primary[300],
      },
    },
    secondary: {
      backgroundColor: "white",
      textColor: colors.gray[600],
      border: "1px",
      borderColor: colors.gray[200],
      _hover: {
        borderColor: colors.gray[300],
      },
      _active: {
        borderColor: colors.gray[200],
      },
      _loading: {
        borderColor: colors.gray[700],
      },
      _disabled: {
        backgroundColor: colors.gray[100],
        textColor: colors.gray[400],
        border: "0px",
      },
    },
    tertiary: {
      backgroundColor: colors.gray[200],
      textColor: colors.gray[600],
      _hover: {
        borderColor: colors.gray[300],
      },
      _active: {
        borderColor: colors.gray[200],
      },
      _loading: {
        borderColor: colors.gray[700],
      },
      _disabled: {
        backgroundColor: colors.gray[100],
        textColor: colors.gray[400],
      },
    },
    ghost: {
      _hover: {
        background: "transparent",
        color: "blue.500",
      },
      _active: {
        background: "transparent",
        color: "blue.500",
      },
      _focus: {
        boxShadow: "none",
      },
    },
    feedback: {
      backgroundColor: colors.green[50],
      textColor: colors.green[300],
      border: "1px",
      borderColor: "transparent",
      _hover: {
        backgroundColor: colors.green[100],
      },
      _active: {
        backgroundColor: colors.green[100],
      },
      _loading: {
        backgroundColor: colors.green[100],
      },
      _disabled: {
        textColor: colors.green[300],
      },
    },
    danger: {
      backgroundColor: colors.red[50],
      textColor: colors.red[700],
      border: "1px",
      borderColor: "transparent",
      _hover: {
        backgroundColor: colors.red[100],
      },
      _active: {
        backgroundColor: colors.red[100],
      },
      _loading: {
        backgroundColor: colors.red[100],
      },
      _disabled: {
        textColor: colors.red[300],
      },
    },
  },
  defaultProps: {
    size: "lg",
    variant: "primary",
  },
});
