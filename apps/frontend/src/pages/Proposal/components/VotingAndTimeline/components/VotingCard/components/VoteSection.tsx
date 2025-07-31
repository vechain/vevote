import { Button, Flex, HStack, Icon, Link, Text, UseDisclosureReturn } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { ProposalStatus } from "@/types/proposal";
import { useHasVoted, useVoteByProposalId } from "@/hooks/useCastVote";
import { ArrowLinkIcon, CircleInfoIcon } from "@/icons";
import { useWallet } from "@vechain/vechain-kit";
import { getConfig } from "@repo/config";
import { useCallback, useMemo } from "react";
import { useNodes } from "@/hooks/useUserQueries";
import { IconByVote, ColorByVote } from "../constants";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { useI18nContext } from "@/i18n/i18n-react";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const VoteSection = ({ submitVoteModal }: { submitVoteModal: UseDisclosureReturn }) => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const isUpcoming = proposal.status === ProposalStatus.UPCOMING;
  const isVoting = proposal.status === ProposalStatus.VOTING;
  const { account } = useWallet();

  const { hasVoted } = useHasVoted({ proposalId: proposal?.id || "" });
  const { vote, voteData } = useVoteByProposalId({ proposalId: proposal?.id || "", enabled: hasVoted });

  const { nodes } = useNodes();

  const isVoter = useMemo(() => nodes.length > 0, [nodes.length]);

  const voteIcon = IconByVote[vote];
  const voteColor = ColorByVote[vote];

  const cantVote = useMemo(
    () => isUpcoming || !account || hasVoted || !isVoter,
    [account, hasVoted, isVoter, isUpcoming],
  );

  const cantVoteReason = useMemo(() => {
    if (isUpcoming) return LL.voting_list.voting_has_not_started_yet();
    if (!account) return LL.voting_list.please_connect_your_wallet();
    if (hasVoted) return LL.voting_list.you_have_already_voted();
    if (!isVoter) return LL.voting_list.you_dont_have_enough_voting_power();
    return "";
  }, [LL, account, hasVoted, isVoter, isUpcoming]);

  const handleVote = useCallback(() => {
    trackEvent(MixPanelEvent.CTA_VOTE_CLICKED, {
      proposalId: proposal?.id || "",
      voteOption: "submit",
    });
    submitVoteModal.onOpen();
  }, [proposal?.id, submitVoteModal]);

  if (proposal.status === ProposalStatus.DRAFT) {
    return null;
  }

  if (hasVoted) {
    return (
      <HStack
        gap={4}
        padding={{ base: 4, md: 6 }}
        justifyContent={"space-between"}
        borderTop={"1px solid"}
        borderColor={"gray.200"}>
        <HStack gap={6}>
          <Text fontSize={"sm"} fontWeight={500} color={"gray.600"}>
            {LL.proposal.you_voted()}
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
          href={`${EXPLORER_URL}/transactions/${voteData?.transactionId}`}>
          {LL.proposal.see_details()}
          <Icon as={ArrowLinkIcon} width={4} height={4} />
        </Link>
      </HStack>
    );
  }

  if (!isVoting && !isUpcoming) {
    return null;
  }

  return (
    <Flex
      flexDirection={"column"}
      gap={4}
      padding={{ base: "16px", md: "24px" }}
      borderTop={"1px solid"}
      borderColor={"gray.200"}>
      <Button
        width={"100%"}
        height={"56px"}
        backgroundColor={isUpcoming ? "primary.100" : "primary.500"}
        color={isUpcoming ? "primary.300" : "white"}
        fontWeight={600}
        fontSize={"16px"}
        borderRadius={8}
        isDisabled={cantVote}
        loadingText={LL.proposal.confirm_in_your_wallet()}
        onClick={handleVote}
        _hover={{
          backgroundColor: isUpcoming ? "primary.100" : "primary.600",
        }}>
        {LL.submit_vote()}
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
