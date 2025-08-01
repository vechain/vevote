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
      justifyContent={{ base: "flex-start", md: "space-between" }}
      flexDirection={{ base: "column", md: "row" }}
      gap={6}
      alignItems={"start"}
      paddingBottom={4}
      borderBottomWidth={"1px"}
      borderColor={"gray.100"}>
      <Skeleton height={{ base: "20px", md: "24px" }} width={{ base: "280px", md: "400px" }} />
      <Flex alignItems={"center"} gap={4}>
        <Flex alignItems={"center"} gap={2} borderRightWidth={"1px"} borderColor={"gray.100"} paddingRight={4}>
          <Skeleton height={{ base: "14px", md: "16px" }} width="20px" />
          <Skeleton height={{ base: "14px", md: "16px" }} width="80px" />
          <Skeleton height={6} width={6} borderRadius="full" />
        </Flex>
        <Skeleton height="20px" width="20px" borderRadius="4px" />
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
        <Skeleton height="32px" width="100px" borderRadius="16px" />
        <Flex alignItems={"center"} gap={2}>
          <Skeleton height={{ base: "12px", md: "14px" }} width="35px" />
          <Skeleton height={{ base: "12px", md: "14px" }} width="100px" />
        </Flex>
      </Flex>
      <VotingResultsSkeleton />
    </Flex>
  );
};

const VotingResultsSkeleton = () => {
  return (
    <Flex gap={{ base: 3, md: 6 }} alignItems={"center"}>
      {[...Array(3)].map((_, index) => (
        <Flex
          key={index}
          alignItems={"center"}
          gap={2}
          padding={2}
          borderRadius={"xl"}>
          <Skeleton height="16px" width="16px" borderRadius="2px" />
          <Skeleton height={{ base: "14px", md: "16px" }} width="45px" />
        </Flex>
      ))}
    </Flex>
  );
};
