import { Flex, Heading, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const SummaryCard = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <Flex
      width={"full"}
      padding={6}
      borderRadius={24}
      flexDirection={"column"}
      alignItems={"start"}
      gap={6}
      backgroundColor={"gray.100"}>
      <Heading fontSize={20} fontWeight={600} color={"gray.600"}>
        {title}
      </Heading>
      <Flex
        width={"full"}
        padding={10}
        borderRadius={12}
        alignItems={"start"}
        flexDirection={"column"}
        gap={6}
        backgroundColor={"white"}>
        {children}
      </Flex>
    </Flex>
  );
};

const BaseItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <Flex gap={3}>
      <Text fontWeight={500} color={"gray.800"} width={160}>
        {label}
      </Text>
      <Text color={"gray.600"} flex={1}>
        {value}
      </Text>
    </Flex>
  );
};

SummaryCard.BaseItem = BaseItem;

export { SummaryCard };
