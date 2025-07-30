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
      <Flex
        width={"100%"}
        flexDirection={"column"}
        gap={6}
        alignItems={"start"}
        paddingBottom={4}
        borderBottomWidth={"1px"}
        borderColor={"gray.100"}>
        <Skeleton height={{ base: "20px", md: "24px" }} width={{ base: "250px", md: "350px" }} />
        <Flex alignItems={"center"} gap={4}>
          <Flex alignItems={"center"} gap={1} borderRightWidth={"1px"} borderColor={"gray.100"} paddingRight={4}>
            <Skeleton height={{ base: "14px", md: "16px" }} width="20px" />
            <Skeleton height={{ base: "14px", md: "16px" }} width="80px" />
            <Skeleton height={{ base: 6, md: 6 }} width={{ base: 6, md: 6 }} borderRadius="full" />
          </Flex>
        </Flex>
      </Flex>
      <Flex
        width={"100%"}
        justifyContent={"space-between"}
        alignItems={{ base: "start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        gap={4}>
        <Flex gap={4} alignItems={"center"} width={"fit-content"}>
          <Skeleton height="24px" width="80px" borderRadius="12px" />
          <Flex alignItems={"center"} gap={2}>
            <Skeleton height={{ base: "12px", md: "14px" }} width="30px" />
            <Skeleton height={{ base: "12px", md: "14px" }} width="80px" />
          </Flex>
        </Flex>
        <Flex gap={2} alignItems={"center"}>
          <Skeleton height="20px" width="60px" borderRadius="4px" />
          <Skeleton height="20px" width="60px" borderRadius="4px" />
          <Skeleton height="20px" width="60px" borderRadius="4px" />
        </Flex>
      </Flex>
    </Flex>
  );
};