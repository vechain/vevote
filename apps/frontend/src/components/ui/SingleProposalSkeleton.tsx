import { Box, Flex, Skeleton } from "@chakra-ui/react";

export const SingleProposalSkeleton = () => {
  return (
    <Flex flexDirection={"column"} gap={10} width={"full"}>
      <Skeleton borderRadius={16} width={"100%"} aspectRatio={"5/2"} />

      <Flex flexDirection={"column"} gap={10} alignItems={"start"}>
        <Flex flexDirection={"column"} gap={4} width={"100%"}>
          <Skeleton height="32px" width="60px" borderRadius="16px" />
          <Skeleton height={{ base: "28px", md: "36px" }} width={{ base: "250px", md: "400px" }} />
          <Skeleton height="20px" width="150px" />
        </Flex>

        <Flex gap={4} width={"100%"} direction={{ base: "column", lg: "row" }} wrap="wrap">
          <Skeleton height="80px" flex="1" minWidth="200px" borderRadius="12px" />
          <Skeleton height="80px" flex="1" minWidth="200px" borderRadius="12px" />
          <Skeleton height="80px" flex="1" minWidth="200px" borderRadius="12px" />
        </Flex>

        <Box width={"100%"}>
          <Skeleton height="120px" width="100%" borderRadius="12px" />
        </Box>
      </Flex>

      <Flex flexDirection={"column"} gap={6} width={"100%"}>
        <Skeleton height="24px" width="120px" />
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <Skeleton height="60px" flex="1" borderRadius="12px" />
          <Skeleton height="60px" flex="1" borderRadius="12px" />
        </Flex>
        <Skeleton height="40px" width="100px" borderRadius="20px" />
      </Flex>

      <Box width={"100%"}>
        <Skeleton height="80px" width="100%" borderRadius="12px" />
      </Box>
    </Flex>
  );
};
