import { Button, Flex, HStack, Icon, Link, Text, UseDisclosureReturn } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { ProposalStatus, SingleChoiceEnum } from "@/types/proposal";
import { useHasVoted, useVotedChoices } from "@/hooks/useCastVote";
import { AbstainIcon, ArrowLinkIcon, CircleInfoIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/icons";
import { useWallet } from "@vechain/vechain-kit";
import { getConfig } from "@repo/config";
import { useMemo } from "react";
import { useNodes } from "@/hooks/useUserQueries";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

const IndexToVoteMap = [SingleChoiceEnum.AGAINST, SingleChoiceEnum.FOR, SingleChoiceEnum.ABSTAIN];
const ColorByVote = {
  [SingleChoiceEnum.AGAINST]: "red.600",
  [SingleChoiceEnum.FOR]: "green.600",
  [SingleChoiceEnum.ABSTAIN]: "orange.400",
};
const IconByVote = {
  [SingleChoiceEnum.AGAINST]: <ThumbsDownIcon width={"20px"} height={"20px"} />,
  [SingleChoiceEnum.FOR]: <ThumbsUpIcon width={"20px"} height={"20px"} />,
  [SingleChoiceEnum.ABSTAIN]: <AbstainIcon width={"20px"} height={"20px"} />,
};

export const VoteSection = ({ submitVoteModal }: { submitVoteModal: UseDisclosureReturn }) => {
  const { proposal } = useProposal();
  const isUpcoming = proposal.status === ProposalStatus.UPCOMING;
  const { account } = useWallet();

  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });
  const { votedChoices } = useVotedChoices({ proposalId: proposal?.id || "", enabled: hasVoted });
  const { nodes } = useNodes();

  const isVoter = useMemo(() => nodes.length > 0, [nodes.length]);
  const vote = IndexToVoteMap[votedChoices?.choice || 0];
  const voteIcon = IconByVote[vote];
  const voteColor = ColorByVote[vote];

  const cantVote = useMemo(
    () => isUpcoming || !account || hasVoted || !isVoter,
    [account, hasVoted, isVoter, isUpcoming],
  );

  const cantVoteReason = useMemo(() => {
    if (isUpcoming) return "Voting has not started yet";
    if (!account) return "Please connect your wallet";
    if (hasVoted) return "You have already voted";
    if (!isVoter) return "You don't have enough voting power";
    return "";
  }, [account, hasVoted, isVoter, isUpcoming]);

  if (proposal.status === ProposalStatus.DRAFT) {
    return null;
  }

  if (hasVoted) {
    return (
      <HStack gap={4} padding={{ base: 4, md: 6 }} justifyContent={"space-between"}>
        <HStack gap={6}>
          <Text fontSize={"sm"} fontWeight={500} color={"gray.600"}>
            You voted
          </Text>
          <HStack
            borderRadius={8}
            border={"2px solid"}
            padding={{ base: "4px 8px", md: "8px 12px" }}
            backgroundColor={"white"}
            borderColor={voteColor}>
            {voteIcon}
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight={600} color={voteColor}>
              {vote}
            </Text>
          </HStack>
        </HStack>
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
    <Flex flexDirection={"column"} gap={4} padding={{ base: "16px", md: "24px" }}>
      <Button
        width={"100%"}
        height={"56px"}
        backgroundColor={isUpcoming ? "primary.100" : "primary.500"}
        color={isUpcoming ? "primary.300" : "white"}
        fontWeight={600}
        fontSize={"16px"}
        borderRadius={8}
        isDisabled={cantVote}
        loadingText={"Confirm in your wallet"}
        onClick={submitVoteModal.onOpen}
        _hover={{
          backgroundColor: isUpcoming ? "primary.100" : "primary.600",
        }}>
        {"Submit your vote"}
      </Button>
      {cantVoteReason && (
        <HStack>
          <Text fontSize={"sm"} fontWeight={500} color={"orange.500"}>
            <Icon as={CircleInfoIcon} width={4} height={4} />
          </Text>
          <Text fontSize={"sm"} fontWeight={500} color={"orange.500"}>
            {cantVoteReason}
          </Text>
        </HStack>
      )}
    </Flex>
  );
};
