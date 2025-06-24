import { Flex, FlexProps } from "@chakra-ui/react";

export const CreateFormWrapper = ({ children, ...restProps }: FlexProps) => {
  return (
    <Flex
      maxWidth={"664px"}
      flexDirection={"column"}
      gap={16}
      margin={"auto"}
      paddingX={6}
      paddingY={{ base: 6, lg: 20 }}
      {...restProps}>
      {children}
    </Flex>
  );
};
