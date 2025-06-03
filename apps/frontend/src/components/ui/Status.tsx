import { CheckSquareIcon } from "@/icons";
import { Flex, FlexProps, Icon, Text } from "@chakra-ui/react";

export const Status = ({ text, ...restProps }: FlexProps & { text: string }) => {
  return (
    <Flex align="center" gap={3} {...restProps}>
      <Text color={"primary.500"} fontWeight={600} lineHeight={6}>
        {text}
      </Text>
      <Icon as={CheckSquareIcon} color={"primary.500"} />
    </Flex>
  );
};
