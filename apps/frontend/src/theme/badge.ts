import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const baseStyle = defineStyle({
  padding: "0 12px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderRadius: "8px",
  fontWeight: "600",
  fontFamily: "Inter, sans-serif",
  lineHeight: "24px",
  textTransform: "none",
});

const draft = defineStyle({
  background: "gray.200",
  color: "gray.600",
});

const upcoming = defineStyle({
  background: "blue.100",
  color: "blue.700",
});

const voting = defineStyle({
  background: "green.100",
  color: "green.700",
});

const approved = defineStyle({
  background: "green.100",
  color: "green.700",
});

const canceled = defineStyle({
  background: "red.100",
  color: "red.700",
});

export const badgeTheme = defineStyleConfig({
  baseStyle,
  variants: { draft, upcoming, voting, approved, canceled, rejected: canceled, executed: approved },
  defaultProps: {
    variant: "draft",
  },
});
