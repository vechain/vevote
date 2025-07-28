import { Flex, Text } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { IconBadge } from "@/components/ui/IconBadge";
import { formatAddress } from "@/utils/address";
import { useMemo } from "react";

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
    <Flex flexDirection={"column"} gap={4} paddingBottom={4} borderBottom={"1px solid"} borderColor={"gray.100"}>
      {/* Status badge and proposer info row */}
      <Flex
        justifyContent={"space-between"}
        alignItems={{ base: "start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 2, md: 4 }}>
        {/* Status badge */}
        <IconBadge variant={infoVariant} />

        {/* Proposer info and Discourse link */}
        <Flex
          alignItems={"center"}
          gap={4}
          borderLeft={{ base: "none", md: "1px solid" }}
          borderColor={{ base: "transparent", md: "gray.100" }}
          paddingLeft={{ base: 0, md: 4 }}>
          <Flex alignItems={"center"} gap={2}>
            <Text color={"gray.500"} fontSize={{ base: "14px", md: "16px" }}>
              by
            </Text>
            <Text color={"gray.800"} fontSize={{ base: "14px", md: "16px" }} fontWeight={400}>
              {formatAddress(proposal.proposer)}
            </Text>
            <Flex
              width={{ base: "16px", md: "24px" }}
              height={{ base: "16px", md: "24px" }}
              borderRadius={"full"}
              backgroundColor={"gray.300"}
            />
          </Flex>

          {/* Discourse icon */}
          <Flex width={"24px"} height={"24px"} backgroundColor={"gray.300"} borderRadius={"4px"} />
        </Flex>
      </Flex>

      {/* Proposal title */}
      <Text fontSize={{ base: "20px", md: "24px" }} fontWeight={500} color={"gray.800"} lineHeight={"1.33"}>
        {proposal.title}
      </Text>
    </Flex>
  );
};
