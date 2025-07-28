import { Button, Flex, Text, Icon, useBreakpointValue, FlexProps } from "@chakra-ui/react";
import { CircleInfoIcon, ArrowRightIcon } from "@/icons";

interface NewBuyNodeCtaProps extends FlexProps {
  // Can extend props if needed
}

export const NewBuyNodeCta = (props: NewBuyNodeCtaProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isMobile) {
    return (
      <Flex
        flexDirection={"column"}
        gap={4}
        backgroundColor={"gray.100"}
        padding={"16px"}
        borderRadius={12}
        width={"100%"}
        {...props}>
        <Flex alignItems={"start"} gap={3}>
          <Icon as={CircleInfoIcon} width={5} height={5} color={"gray.600"} marginTop={"2px"} />
          <Flex flexDirection={"column"} gap={2.5} flex={1}>
            <Text fontSize={"14px"} fontWeight={500} color={"gray.600"} lineHeight={"1.43"}>
              Buy another node to increase your voting power on future proposals.
            </Text>
          </Flex>
        </Flex>

        <Flex paddingLeft={8}>
          <Button
            variant={"outline"}
            size={"sm"}
            height={"32px"}
            fontSize={"12px"}
            fontWeight={600}
            color={"gray.600"}
            borderColor={"gray.200"}
            backgroundColor={"white"}
            rightIcon={<Icon as={ArrowRightIcon} width={4} height={4} />}
            _hover={{
              backgroundColor: "gray.50",
            }}>
            Go to Stargate
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      backgroundColor={"gray.100"}
      padding={"24px"}
      borderRadius={12}
      width={"100%"}
      {...props}>
      <Flex alignItems={"center"} gap={4}>
        <Icon as={CircleInfoIcon} width={6} height={6} color={"gray.600"} />
        <Text fontSize={"18px"} fontWeight={500} color={"gray.600"}>
          Buy another node to increase your voting power on future proposals.
        </Text>
      </Flex>

      <Button
        variant={"outline"}
        size={"md"}
        height={"48px"}
        fontSize={"16px"}
        fontWeight={600}
        color={"gray.600"}
        borderColor={"gray.200"}
        backgroundColor={"white"}
        rightIcon={<Icon as={ArrowRightIcon} width={6} height={6} />}
        _hover={{
          backgroundColor: "gray.50",
        }}>
        Go to Stargate
      </Button>
    </Flex>
  );
};
