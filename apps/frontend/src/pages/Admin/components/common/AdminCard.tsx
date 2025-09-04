import { Box, Heading, BoxProps, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface AdminCardProps extends BoxProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function AdminCard({ title, children, ...boxProps }: AdminCardProps) {
  const cardWidth = useBreakpointValue({
    base: "100%",
    md: "fit-content",
  });

  const width = useBreakpointValue({
    base: "auto",
    md: 400,
  });

  const padding = useBreakpointValue({
    base: 3,
    md: 4,
  });

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="8px"
      p={padding}
      w={cardWidth}
      minW={width}
      maxW={width}
      bg={"white"}
      {...boxProps}>
      <Heading size="md" mb={3} color={"primary.700"}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}
