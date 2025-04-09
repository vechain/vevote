import { Flex, Heading, Text } from "@chakra-ui/react";
import { IconBadge } from "../ui/IconBadge";
import { useMemo } from "react";
import { useProposal } from "./ProposalProvider";

export const ProposalInfos = () => {
  const { proposal } = useProposal();
  const infoVariant = useMemo(() => {
    switch (proposal.status) {
      case "min-not-reached":
        return "rejected";
      default:
        return proposal.status;
    }
  }, [proposal.status]);
  return (
    <>
      <Flex flexDirection={"column"} gap={6} alignItems={"start"}>
        <IconBadge variant={infoVariant} />
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
