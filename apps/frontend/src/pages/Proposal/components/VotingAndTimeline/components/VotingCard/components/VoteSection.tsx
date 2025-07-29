import { Button, Flex, HStack, Icon, Link, Text } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { ProposalStatus } from "@/types/proposal";
import { useHasVoted } from "@/hooks/useCastVote";
import { ArrowLinkIcon } from "@/icons";
import { useWallet } from "@vechain/vechain-kit";
import { getConfig } from "@repo/config";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const VoteSection = () => {
  const { proposal } = useProposal();
  const isUpcoming = proposal.status === ProposalStatus.UPCOMING;
  const { account } = useWallet();

  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });

  if (hasVoted) {
    return (
      <HStack>
        <Text fontSize={"14px"} fontWeight={500} color={"gray.600"}>
          You voted
        </Text>

        <Link
          color={"primary.700"}
          fontWeight={500}
          display={"flex"}
          gap={1}
          alignItems={"center"}
          isExternal
          href={`${EXPLORER_URL}/accounts/${account?.address}/txs`}>
          See details
          <Icon as={ArrowLinkIcon} width={4} height={4} />
        </Link>
      </HStack>
    );
  }

  return (
    <Flex flexDirection={"column"} gap={6} padding={{ base: "16px", md: "24px" }}>
      <Button
        width={"100%"}
        height={"56px"}
        backgroundColor={isUpcoming ? "primary.100" : "primary.500"}
        color={isUpcoming ? "primary.300" : "white"}
        fontWeight={600}
        fontSize={"16px"}
        borderRadius={8}
        isDisabled={isUpcoming}
        loadingText={"Confirm in your wallet"}
        _hover={{
          backgroundColor: isUpcoming ? "primary.100" : "primary.600",
        }}>
        Submit your vote
      </Button>
    </Flex>
  );
};
