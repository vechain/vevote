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
      justifyContent={"flex-start"}
      flexDirection={"column"}
      gap={6}
      alignItems={"start"}
      paddingBottom={4}
      borderBottomWidth={"1px"}
      borderColor={"gray.100"}>
      <Skeleton height={{ base: "20px", md: "20px" }} width={{ base: "280px", md: "400px" }} />
      <Flex alignItems={"center"} gap={4}>
        <Flex alignItems={"center"} gap={2} borderRightWidth={"1px"} borderColor={"gray.100"} paddingRight={4}>
          <Skeleton height={{ base: "14px", md: "16px" }} width="20px" />
          <Skeleton height={{ base: "14px", md: "16px" }} width="80px" />
          <Skeleton height={6} width={6} borderRadius="full" />
        </Flex>
        <Skeleton height="24px" width="24px" borderRadius="full" />
      </Flex>
    </Flex>
  );
};

const BottomBarSkeleton = () => {
  return (
    <Flex
      width={"100%"}
      justifyContent={"space-between"}
      alignItems={{ base: "start", md: "center" }}
      flexDirection={{ base: "column", md: "row" }}
      gap={4}>
      <Flex gap={4} alignItems={"center"} width={"fit-content"}>
        <Skeleton height="32px" width="100px" borderRadius="8px" />
      </Flex>
      <VotingResultsSkeleton />
    </Flex>
  );
};

const VotingResultsSkeleton = () => {
  return (
    <Flex gap={6} alignItems={"center"}>
      {[...Array(2)].map((_, index) => (
        <Flex key={index} alignItems={"center"} borderRadius={"xl"}>
          <Skeleton height="16px" width="16px" borderRadius="2px" />
        </Flex>
      ))}
    </Flex>
  );
};
