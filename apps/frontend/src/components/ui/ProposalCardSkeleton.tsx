import { Flex, Icon, Skeleton } from "@chakra-ui/react";
import { ChevronRightIcon } from "@/icons";

export const ProposalCardSkeleton = () => {
  return (
    <Flex
      width={"100%"}
      paddingY={{ base: 4, md: 8 }}
      paddingLeft={{ base: 4, md: 8 }}
      paddingRight={{ base: 4, md: 6 }}
      bg={"white"}
      borderRadius={16}
      border={"1px"}
      borderColor={"#F1F2F3"}
      gap={{ base: 4, md: 6 }}
      alignItems={"center"}>
      <Flex width={"100%"} direction={"column"} gap={{ base: 3, md: 6 }}>
        <Flex gap={4} alignItems={"center"}>
          <Skeleton height="24px" width="80px" borderRadius="12px" />
        </Flex>
        <Flex gap={{ base: 2, md: 4 }} alignItems={"start"} direction={"column"}>
          <Skeleton height={{ base: "16px", md: "20px" }} width={{ base: "200px", md: "300px" }} />
          <Flex alignItems={"center"} gap={2}>
            <Skeleton height="16px" width="16px" />
            <Skeleton height="14px" width="60px" />
            <Skeleton height="14px" width="100px" />
          </Flex>
        </Flex>
      </Flex>
      <Icon as={ChevronRightIcon} width={4} height={4} color={"gray.500"} />
    </Flex>
  );
};