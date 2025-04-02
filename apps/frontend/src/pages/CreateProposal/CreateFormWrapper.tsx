import { Flex, FlexProps } from "@chakra-ui/react";

export const CreateFormWrapper = ({ children, ...restProps }: FlexProps) => {
  return (
    <Flex maxWidth={"664px"} flexDirection={"column"} gap={16} {...restProps}>
      {children}
    </Flex>
  );
};
