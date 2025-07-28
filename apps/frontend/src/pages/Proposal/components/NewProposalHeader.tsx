import { Avatar, Divider, Flex, HStack, Text } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { IconBadge } from "@/components/ui/IconBadge";
import { formatAddress } from "@/utils/address";
import { useMemo } from "react";
import { getPicassoImgSrc } from "@/utils/picasso";

export const NewProposalHeader = () => {
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
    <Flex flexDirection={"column"} gap={4}>
      {/* Status badge and proposer info row */}
      <HStack justifyContent={"space-between"} alignItems={{ base: "start", md: "center" }} gap={{ base: 2, md: 4 }}>
        {/* Status badge */}
        <IconBadge variant={infoVariant} />

        <Flex alignItems={"center"} gap={4}>
          <Flex alignItems={"center"} gap={2}>
            <Text color={"gray.500"} fontSize={{ base: "14px", md: "16px" }}>
              by
            </Text>
            <Text color={"gray.800"} fontSize={{ base: "14px", md: "16px" }} fontWeight={400}>
              {formatAddress(proposal.proposer)}
            </Text>
            <Avatar size={{ base: "xs", md: "sm" }} src={getPicassoImgSrc(proposal.proposer)} borderRadius="full" />
            <Divider orientation="vertical" borderColor={"gray.100"} />
          </Flex>
        </Flex>
      </HStack>
      <Divider borderColor={"gray.100"} />
    </Flex>
  );
};
