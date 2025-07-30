import { Button, Flex, Text, Icon, HStack, Stack } from "@chakra-ui/react";
import { CircleInfoIcon, ArrowRightIcon } from "@/icons";

export const BuyNodeCta = () => {
  return (
    <HStack
      alignItems={{ base: "flex-start", md: "center" }}
      gap={4}
      backgroundColor={"gray.100"}
      padding={"16px"}
      borderRadius={12}
      width={"100%"}>
      <Icon as={CircleInfoIcon} width={5} height={5} color={"gray.600"} marginTop={"2px"} />
      <Stack
        direction={{ base: "column", md: "row" }}
        alignItems={{ base: "flex-start", md: "center" }}
        justifyContent={"space-between"}
        gap={4}
        width={"100%"}>
        <Flex flexDirection={"column"} gap={2.5} flex={1}>
          <Text fontSize={"14px"} fontWeight={500} color={"gray.600"} lineHeight={"1.43"}>
            Buy another node to increase your voting power on future proposals.
          </Text>
        </Flex>
        <Button
          variant={"outline"}
          size={"md"}
          fontWeight={600}
          color={"gray.600"}
          borderColor={"gray.200"}
          backgroundColor={"white"}
          rounded={"8px"}
          rightIcon={<Icon as={ArrowRightIcon} width={4} height={4} />}
          _hover={{
            backgroundColor: "gray.50",
          }}
          onClick={() => window.open("https://app.stargate.vechain.org", "_blank")}>
          Go to Stargate
        </Button>
      </Stack>
    </HStack>
  );
};
