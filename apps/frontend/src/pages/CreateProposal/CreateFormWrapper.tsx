import { Flex, FlexProps } from "@chakra-ui/react";

export const CreateFormWrapper = ({ children, ...restProps }: FlexProps) => {
  return (
    <Flex
      maxWidth={"664px"}
      flexDirection={"column"}
      gap={{ base: 12, md: 16 }}
      margin={"auto"}
      paddingY={{ base: 6, lg: 20 }}
      paddingX={{ base: 6, md: 0 }}
      {...restProps}>
      {children}
    </Flex>
  );
};
