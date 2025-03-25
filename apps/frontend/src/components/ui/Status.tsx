import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiCheckSquare } from "react-icons/fi";

export const Status = ({ text }: { text: string }) => {
  return (
    <Flex align="center" gap={3}>
      <Text color={"primary.500"} fontWeight={600} lineHeight={6}>
        {text}
      </Text>
      <Icon as={FiCheckSquare} color={"primary.500"} />
    </Flex>
  );
};
