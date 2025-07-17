import { AlertTriangleIcon, CircleInfoIcon, CircleXIcon } from "@/icons";
import { defineStyle, Flex, FlexProps, Icon } from "@chakra-ui/react";

export type InfoBoxProps = FlexProps & {
  variant: "info" | "warning" | "error" | "success";
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
  warning: {
    icon: AlertTriangleIcon,
    style: defineStyle({
      borderColor: "yellow.200",
      backgroundColor: "yellow.50",
      color: "yellow.700",
    }),
  },
  error: {
    icon: CircleXIcon,
    style: defineStyle({
      borderColor: "red.200",
      backgroundColor: "red.50",
      color: "red.700",
    }),
  },
  success: {
    icon: CircleInfoIcon,
    style: defineStyle({
      borderColor: "green.200",
      backgroundColor: "green.50",
      color: "green.700",
    }),
  },
};

export const GenericInfoBox = ({ children, variant, ...restProps }: InfoBoxProps) => {
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
      <Icon
        as={infoBoxVariants[variant].icon}
        color={infoBoxVariants[variant].style.color}
        boxSize={{ base: 4, md: 6 }}
      />
      {children}
    </Flex>
  );
};
