import { Flex, FlexProps, Icon, Text } from "@chakra-ui/react";
import { FiCheckSquare } from "react-icons/fi";

export const Status = ({ text, ...restProps }: FlexProps & { text: string }) => {
  return (
    <Flex align="center" gap={3} {...restProps}>
      <Text color={"primary.500"} fontWeight={600} lineHeight={6}>
        {text}
      </Text>
      <Icon as={FiCheckSquare} color={"primary.500"} />
    </Flex>
  );
};
