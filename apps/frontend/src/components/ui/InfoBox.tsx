import { defineStyle, Flex, FlexProps, Icon } from "@chakra-ui/react";
import { FcCancel } from "react-icons/fc";
import { GoCheckCircle, GoXCircle } from "react-icons/go";
import { IoIosInformationCircleOutline } from "react-icons/io";

export type InfoBoxProps = FlexProps & {
  variant: "info" | "approved" | "executed" | "min-not-reached" | "rejected" | "canceled";
};

export const infoBoxVariants = {
  info: {
    icon: IoIosInformationCircleOutline,
    style: defineStyle({
      borderColor: "blue.200",
      backgroundColor: "blue.50",
      color: "blue.700",
    }),
  },
  approved: {
    icon: GoCheckCircle,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.700",
    }),
  },
  executed: {
    icon: GoCheckCircle,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.700",
    }),
  },
  "min-not-reached": {
    icon: FcCancel,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.700",
    }),
  },
  rejected: {
    icon: GoXCircle,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.700",
    }),
  },
  canceled: {
    icon: GoXCircle,
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
