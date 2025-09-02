import { Box, Heading, BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";

interface AdminCardProps extends BoxProps {
  title: string;
  children: ReactNode;
}

export function AdminCard({ title, children, ...boxProps }: AdminCardProps) {
  return (
    <Box 
      border="1px" 
      borderColor="gray.200" 
      borderRadius="md" 
      p={4} 
      w={"fit-content"} 
      minW={300}
      {...boxProps}
    >
      <Heading size="sm" mb={3}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}