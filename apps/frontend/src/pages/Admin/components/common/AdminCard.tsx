import { Box, Heading, BoxProps, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface AdminCardProps extends BoxProps {
  title: string;
  children: ReactNode;
}

export function AdminCard({ title, children, ...boxProps }: AdminCardProps) {
  const cardWidth = useBreakpointValue({
    base: "100%",
    md: "fit-content",
  });

  const minWidth = useBreakpointValue({
    base: "auto",
    md: 300,
  });

  const padding = useBreakpointValue({
    base: 3,
    md: 4,
  });

  return (
    <Box 
      border="1px" 
      borderColor="gray.200" 
      borderRadius="md" 
      p={padding} 
      w={cardWidth}
      minW={minWidth}
      {...boxProps}
    >
      <Heading size="sm" mb={3}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}