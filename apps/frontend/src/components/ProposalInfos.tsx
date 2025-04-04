import { Flex, Heading, Text } from "@chakra-ui/react";
import { IconBadge } from "./ui/IconBadge";
import { ProposalCardType } from "@/types/proposal";

export const ProposalInfos = ({ proposal }: { proposal: ProposalCardType }) => {
  return (
    <>
      <Flex flexDirection={"column"} gap={6} alignItems={"start"}>
        <IconBadge variant={proposal.status} />
        <Heading fontSize={32} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
      </Flex>
      <Flex flexDirection={"column"} gap={4} alignItems={"start"}>
        <Heading fontSize={20} fontWeight={600} color="primary.700">
          {proposal.title}
        </Heading>
        {/* TODO: Add text editor read only */}
        <Text fontSize={18} fontWeight={600} color="gray.600">
          {proposal.description}
        </Text>
      </Flex>
    </>
  );
};
