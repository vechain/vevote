import { CancelIcon, CheckCircleIcon, CircleInfoIcon, CircleXIcon } from "@/icons";
import { defineStyle, Flex, FlexProps, Icon } from "@chakra-ui/react";

export type InfoBoxProps = FlexProps & {
  variant: "info" | "approved" | "executed" | "min-not-reached" | "rejected" | "canceled";
};

export const infoBoxVariants = {
  info: {
    icon: CircleInfoIcon,
    style: defineStyle({
      borderColor: "blue.200",
      backgroundColor: "blue.50",
      color: "blue.700",
    }),
  },
  approved: {
    icon: CheckCircleIcon,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.700",
    }),
  },
  executed: {
    icon: CheckCircleIcon,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.700",
    }),
  },
  "min-not-reached": {
    icon: CircleXIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.700",
    }),
  },
  rejected: {
    icon: CircleXIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.700",
    }),
  },
  canceled: {
    icon: CancelIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "gray.100",
      color: "red.700",
    }),
  },
};

export const InfoBox = ({ children, variant, ...restProps }: InfoBoxProps) => {
  return (
    <Flex
      borderColor={infoBoxVariants[variant].style.borderColor}
      backgroundColor={infoBoxVariants[variant].style.backgroundColor}
      borderRadius={12}
      borderWidth={2}
      paddingY={4}
      paddingX={6}
      width={"100%"}
      gap={3}
      {...restProps}>
      <Icon as={infoBoxVariants[variant].icon} color={infoBoxVariants[variant].style.color} />
      {children}
    </Flex>
  );
};
