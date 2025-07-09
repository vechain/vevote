import { Box, BoxProps } from "@chakra-ui/react";

export const SectionLimiter = ({ children, ...restProps }: BoxProps) => {
  return (
    <Box paddingY={{ base: 6, md: 10 }} paddingX={{ base: 6, md: 11 }} {...restProps}>
      {children}
    </Box>
  );
};
