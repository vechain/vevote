import { defineStyle } from "@chakra-ui/react";

export const stargateButtonStyle = defineStyle({
  width: { base: "full", lg: "fit-content" },
  bg: "rgba(45, 45, 45, 0.10)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  color: "white",
  paddingX: 4,
  paddingY: 6,
  maxHeight: { base: "40px", md: "48px" },
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: "99px",
  _hover: {
    textDecoration: "none",
  },
});
