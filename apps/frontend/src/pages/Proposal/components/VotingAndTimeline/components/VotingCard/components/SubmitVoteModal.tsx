import {
  ModalHeader,
  UseDisclosureReturn,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Box,
  Radio,
  Spinner,
  Link,
  ModalBody,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { SingleChoiceEnum } from "@/types/proposal";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { VoteIcon, CheckIcon, VotingPowerIcon, ArrowLinkIcon } from "@/icons";
import { useNodes } from "@/hooks/useUserQueries";
import { useCastVote } from "@/hooks/useCastVote";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { trackEvent, MixPanelEvent } from "@/utils/mixpanel/utilsMixpanel";
import { IconByVote, ColorByVote } from "../constants";
import { getIndexFromSingleChoice } from "@/utils/proposals/helpers";
import { getConfig } from "@repo/config";
import { useWallet } from "@vechain/vechain-kit";
import { ModalSkeleton } from "@/components/ui/ModalSkeleton";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const SubmitVoteModal = ({ submitVoteModal }: { submitVoteModal: UseDisclosureReturn }) => {
  const { proposal } = useProposal();
  const { account } = useWallet();
  const { nodes, masterNode } = useNodes();
  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const totalVotingPower = useMemo(() => {
    return nodes.reduce((acc, node) => acc + Number(node.votingPower) / 100, 0);
  }, [nodes]);

  const formattedVotingPower = useMemo(() => {
    return new Intl.NumberFormat().format(totalVotingPower);
  }, [totalVotingPower]);

  const { sendTransaction, isTransactionPending } = useCastVote({
    proposalId: proposal.id,
    masterNode,
  });

  const handleConfirmVote = async () => {
    if (!selectedOption) return;

    const voteIndex = getIndexFromSingleChoice(selectedOption);

    try {
      trackEvent(MixPanelEvent.PROPOSAL_VOTE, {
        proposalId: proposal.id,
        vote: defaultSingleChoice[voteIndex],
        reason: "",
      });
      // Close the modal after selection - in real implementation, this would trigger the actual voting
      const result = await sendTransaction({ id: proposal.id, selectedOption: voteIndex as 0 | 1 | 2, reason: "" });
      trackEvent(MixPanelEvent.PROPOSAL_VOTE_SUCCESS, {
        proposalId: proposal.id,
        vote: defaultSingleChoice[voteIndex],
        transactionId: result.txId,
        reason: "",
      });
      setIsSuccess(true);
    } catch (error) {
      const txError = error as { txId?: string; error?: { message?: string }; message?: string };
      const txId = txError.txId || "unknown";
      trackEvent(MixPanelEvent.PROPOSAL_VOTE_FAILED, {
        proposalId: proposal.id,
        vote: defaultSingleChoice[voteIndex],
        error: txError.error?.message || txError.message || "Unknown error",
        transactionId: txId,
        reason: "",
      });
      throw error;
    }
  };

  if (isSuccess) {
    const selectedIcon = selectedOption ? IconByVote[selectedOption] : null;
    const selectedColor = selectedOption ? ColorByVote[selectedOption] : "gray.500";

    return (
      <ModalSkeleton isOpen={submitVoteModal.isOpen} onClose={submitVoteModal.onClose} trapFocus={false} size="md">
        <ModalBody>
          <VStack spacing={6} align="center">
            {/* Header with icon and title */}
            <VStack spacing={6} align="center">
              <Icon as={VoteIcon} boxSize={10} color="primary.500" />
              <Text fontSize="xl" fontWeight="semibold" color="gray.600" textAlign="center">
                Vote submitted successfully!
              </Text>
            </VStack>

            {/* Vote selection display and see details */}
            <VStack spacing={6} align="center" w="full">
              {/* Selected vote display */}
              {selectedOption && (
                <Box p={3} borderRadius="lg" border="2px solid" borderColor={selectedColor} bg="white" w="fit-content">
                  <HStack spacing={2} align="center">
                    <Icon as={() => selectedIcon} color={selectedColor} boxSize={5} />
                    <Text fontSize="sm" fontWeight="semibold" color={selectedColor}>
                      {selectedOption}
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* See details link */}
              <Link
                href="#"
                onClick={e => {
                  e.preventDefault();
                  // Add navigation logic here
                }}
                _hover={{ textDecoration: "none" }}>
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
              </Link>
            </VStack>

            {/* Close button */}
            <Button
              onClick={submitVoteModal.onClose}
              w="full"
              h={14}
              bg="gray.200"
              color="gray.600"
              fontSize="md"
              fontWeight="semibold"
              borderRadius="lg"
              _hover={{ bg: "gray.300" }}
              _active={{ bg: "gray.300" }}>
              Close
            </Button>
          </VStack>
        </ModalBody>
      </ModalSkeleton>
    );
  }

  return (
    <ModalSkeleton
      isOpen={submitVoteModal.isOpen}
      onClose={submitVoteModal.onClose}
      trapFocus={false}
      size="md"
      closeOnOverlayClick={false}
      showCloseButton={!isTransactionPending}>
      <ModalHeader pb={4}>
        <HStack justify="space-between" align="center" w="full">
          <HStack spacing={3}>
            <Icon as={VoteIcon} boxSize={6} color="primary.500" />
            <Text fontSize="lg" fontWeight={600} color="primary.600">
              Submit your Vote
            </Text>
          </HStack>
        </HStack>
      </ModalHeader>
      <ModalBody>
        <VStack spacing={6} align="stretch">
          {/* Vote Options */}
          <VStack spacing={3} align="stretch">
            {defaultSingleChoice.map((option: SingleChoiceEnum) => {
              const isSelected = selectedOption === option;
              const icon = IconByVote[option];
              const color = ColorByVote[option];

              return (
                <Box
                  key={option}
                  as="button"
                  onClick={() => {
                    if (isTransactionPending) return;
                    setSelectedOption(option);
                  }}
                  p={4}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={isSelected ? color : "gray.200"}
                  bg={"white"}
                  transition="all 0.2s"
                  _hover={
                    isTransactionPending
                      ? {}
                      : {
                          borderColor: color,
                          bg: `${color.split(".")[0]}.50`,
                        }
                  }
                  cursor="pointer">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon as={() => icon} color={color} boxSize={5} />
                      <Text fontSize="md" fontWeight={isSelected ? 600 : 500} color={color}>
                        {option}
                      </Text>
                    </HStack>
                    <Radio
                      isChecked={isSelected}
                      colorScheme={color.split(".")[0]}
                      pointerEvents="none"
                      isDisabled={isTransactionPending}
                    />
                  </HStack>
                </Box>
              );
            })}
          </VStack>

          {/* Voting Power */}
          <Box p={4} bg="gray.50" borderRadius="lg">
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={VotingPowerIcon} boxSize={4} color="gray.500" />
                <Text fontSize="sm" fontWeight={500} color="gray.500">
                  Your Voting power
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight={600} color="gray.500">
                {formattedVotingPower}
              </Text>
            </HStack>
          </Box>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmVote}
            isDisabled={!selectedOption || isTransactionPending}
            isLoading={isTransactionPending}
            loadingText="Waiting wallet confirmation..."
            colorScheme="primary"
            size="lg"
            fontSize="md"
            fontWeight={600}
            leftIcon={isTransactionPending ? <Spinner size="sm" /> : <Icon as={CheckIcon} boxSize={4} color="white" />}
            w="full">
            Confirm vote
          </Button>
        </VStack>
      </ModalBody>
    </ModalSkeleton>
  );
};
