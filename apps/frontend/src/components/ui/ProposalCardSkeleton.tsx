import { Flex, Skeleton } from "@chakra-ui/react";

export const ProposalCardSkeleton = () => {
  return (
    <Flex
      width={"100%"}
      padding={6}
      bg={"white"}
      borderRadius={16}
      border={"1px"}
      borderColor={"gray.100"}
      gap={6}
      alignItems={"start"}
      flexDirection={"column"}>
      <TopBarSkeleton />
      <BottomBarSkeleton />
    </Flex>
  );
};

const TopBarSkeleton = () => {
  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      flexDirection={"column"}
      gap={3}
      alignItems={"start"}
      paddingBottom={4}
      borderBottomWidth={"1px"}
      borderColor={"gray.100"}>
      <Skeleton height={{ base: "20px", md: "20px" }} width={{ base: "280px", md: "400px" }} />
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        width={"full"}
        justifyContent={{ base: "flex-start", md: "space-between" }}>
        <Flex alignItems={"center"} gap={4}>
          <Flex alignItems={"center"} gap={2} borderRightWidth={"1px"} borderColor={"gray.100"} paddingRight={4}>
            <Skeleton height={{ base: "14px", md: "16px" }} width="20px" />
            <Skeleton height={{ base: "14px", md: "16px" }} width="80px" />
            <Skeleton height={6} width={6} borderRadius="full" />
          </Flex>
          <Skeleton height="24px" width="24px" borderRadius="full" />
        </Flex>
        {/* You voted section skeleton */}
        <Flex gap={4} alignItems={"center"}>
          <Skeleton height="14px" width="80px" />
          <Flex
            borderRadius={8}
            border={"2px solid"}
            padding={{ base: "4px 8px", md: "8px 12px" }}
            backgroundColor={"white"}
            borderColor={"gray.200"}>
            <Flex alignItems={"center"} gap={2}>
              <Skeleton height={4} width={4} />
              <Skeleton height={{ base: "12px", md: "14px" }} width="60px" />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

const BottomBarSkeleton = () => {
  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      alignItems={"flex-start"}
      flexDirection={"row"}
      gap={4}
      wrap={"wrap"}>
      <Flex gap={4} alignItems={"center"} width={"fit-content"}>
        <Skeleton height="32px" width="100px" borderRadius="8px" />
        {/* Date item skeleton */}
        <Flex alignItems={"center"} gap={2}>
          <Skeleton height={{ base: "12px", md: "14px" }} width="40px" />
          <Skeleton height={{ base: "12px", md: "14px" }} width="80px" />
        </Flex>
      </Flex>
      <VotingResultsSkeleton />
    </Flex>
  );
};

const VotingResultsSkeleton = () => {
  return (
    <Flex gap={3} alignItems={"center"}>
      {[...Array(3)].map((_, index) => (
        <Flex key={index} alignItems={"center"} gap={2}>
          <Skeleton height={4} width={4} />
          <Skeleton height={{ base: "14px", md: "16px" }} width="50px" />
        </Flex>
      ))}
    </Flex>
  );
};
