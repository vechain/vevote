import { DiscourseLink } from "@/components/proposal/DiscourseLink";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { IconBadge } from "@/components/ui/IconBadge";
import { useVechainDomainOrAddress } from "@/hooks/useVechainDomainOrAddress";
import { useI18nContext } from "@/i18n/i18n-react";
import { getPicassoImgSrc } from "@/utils/picasso";
import { Avatar, Divider, Flex, HStack, Text } from "@chakra-ui/react";

export const ProposalHeader = () => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();

  const { addressOrDomain } = useVechainDomainOrAddress(proposal.proposer);

  return (
    <Flex flexDirection={"column"} gap={4} width={"full"}>
      {/* Status badge and proposer info row */}
      <HStack
        justifyContent={"space-between"}
        alignItems={{ base: "start", md: "center" }}
        gap={{ base: 2, md: 4 }}
        wrap={"wrap"}>
        {/* Status badge */}
        <IconBadge variant={proposal.status} />

        <Flex alignItems={"center"} gap={4}>
          <Flex alignItems={"center"} gap={2}>
            <Text color={"gray.500"} fontSize={{ base: "14px", md: "16px" }}>
              {LL.by()}
            </Text>
            <Text color={"gray.800"} fontSize={{ base: "14px", md: "16px" }} fontWeight={400}>
              {addressOrDomain}
            </Text>
            <Avatar
              height={{ base: 4, md: 6 }}
              width={{ base: 4, md: 6 }}
              src={getPicassoImgSrc(proposal.proposer)}
              borderRadius="full"
            />
            <Divider orientation="vertical" borderColor={"gray.100"} height={"24px"} mx={1} />
            {proposal.discourseUrl && <DiscourseLink src={proposal.discourseUrl} />}
          </Flex>
        </Flex>
      </HStack>
      <Divider borderColor={"gray.100"} />
    </Flex>
  );
};
