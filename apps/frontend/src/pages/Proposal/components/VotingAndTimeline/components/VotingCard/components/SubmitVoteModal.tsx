import { useProposal } from "@/components/proposal/ProposalProvider";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { ModalSkeleton } from "@/components/ui/ModalSkeleton";
import { ColorByVote, IconByVote, voteOptions } from "@/constants";
import { useCastVote } from "@/hooks/useCastVote";
import { useNodes } from "@/hooks/useUserQueries";
import { useI18nContext } from "@/i18n/i18n-react";
import { ArrowLinkIcon, CheckIcon, CircleXIcon, VoteIcon, VotingPowerIcon } from "@/icons";
import { SingleChoiceEnum } from "@/types/proposal";
import { MixPanelEvent, trackEvent } from "@/utils/mixpanel/utilsMixpanel";
import { getIndexFromSingleChoice } from "@/utils/proposals/helpers";
import {
  Box,
  Button,
  HStack,
  Icon,
  Link,
  ModalBody,
  ModalHeader,
  Radio,
  Spinner,
  Text,
  UseDisclosureReturn,
  VStack,
} from "@chakra-ui/react";
import { getConfig } from "@repo/config";
import { useCallback, useMemo, useState } from "react";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export const SubmitVoteModal = ({ submitVoteModal }: { submitVoteModal: UseDisclosureReturn }) => {
  const { LL } = useI18nContext();
  const { proposal } = useProposal();
  const { nodes, masterNode } = useNodes();
  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txId, setTxId] = useState<string | undefined>();

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

  const handleClose = useCallback(() => {
    setIsError(false);
    setIsSuccess(false);
    setSelectedOption(undefined);
    setTxId(undefined);
    submitVoteModal.onClose();
  }, [submitVoteModal]);

  const handleConfirmVote = async () => {
    if (!selectedOption) return;

    const voteIndex = getIndexFromSingleChoice(selectedOption);

    try {
      trackEvent(MixPanelEvent.PROPOSAL_VOTE, {
        proposalId: proposal.id,
        vote: selectedOption,
        reason: "",
      });
      const result = await sendTransaction({ id: proposal.id, selectedOption: voteIndex, reason: "" });
      trackEvent(MixPanelEvent.PROPOSAL_VOTE_SUCCESS, {
        proposalId: proposal.id,
        vote: selectedOption,
        transactionId: result.txId,
        reason: "",
      });
      setTxId(result.txId);
      setIsSuccess(true);
    } catch (error) {
      const txError = error as { txId?: string; error?: { message?: string }; message?: string };
      const txId = txError.txId || "unknown";
      trackEvent(MixPanelEvent.PROPOSAL_VOTE_FAILED, {
        proposalId: proposal.id,
        vote: selectedOption,
        error: txError.error?.message || txError.message || LL.proposal.unknown_error(),
        transactionId: txId,
        reason: "",
      });
      setIsError(true);
    }
  };

  if (isError) {
    return (
      <ModalSkeleton isOpen={submitVoteModal.isOpen} onClose={handleClose} trapFocus={false} size="md">
        <ModalBody>
          <VStack spacing={6} align="center">
            {/* Header with icon and title */}
            <VStack spacing={6} align="center">
              <Icon as={CircleXIcon} boxSize={10} color="red.500" />
              <Text fontSize="xl" fontWeight="semibold" color="gray.600" textAlign="center">
                {LL.proposal.vote_submission_failed()}
              </Text>
            </VStack>

            {/* Action buttons */}
            <VStack spacing={3} w="full">
              <Button
                onClick={() => {
                  setIsError(false);
                  handleConfirmVote();
                }}
                w="full"
                h={14}
                bg="red.500"
                color="white"
                fontSize="md"
                fontWeight="semibold"
                borderRadius="lg"
                _hover={{ bg: "red.600" }}
                _active={{ bg: "red.600" }}>
                {LL.try_again()}
              </Button>
              <Button
                onClick={handleClose}
                w="full"
                h={14}
                bg="gray.200"
                color="gray.600"
                fontSize="md"
                fontWeight="semibold"
                borderRadius="lg"
                _hover={{ bg: "gray.300" }}
                _active={{ bg: "gray.300" }}>
                {LL.close()}
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalSkeleton>
    );
  }

  if (isSuccess) {
    const selectedIcon = selectedOption ? IconByVote[selectedOption] : undefined;
    const selectedColor = selectedOption ? ColorByVote[selectedOption] : "gray.500";

    return (
      <ModalSkeleton isOpen={submitVoteModal.isOpen} onClose={handleClose} trapFocus={false} size="md">
        <ModalBody>
          <VStack spacing={6} align="center">
            {/* Header with icon and title */}
            <VStack spacing={6} align="center">
              <Icon as={VoteIcon} boxSize={10} color="primary.500" />
              <Text fontSize="xl" fontWeight="semibold" color="gray.600" textAlign="center">
                {LL.proposal.vote_submitted_successfully()}
              </Text>
            </VStack>

            <VStack spacing={6} align="center" w="full">
              {/* Selected vote display */}
              {selectedOption && (
                <Box p={3} borderRadius="lg" border="2px solid" borderColor={selectedColor} bg="white" w="fit-content">
                  <HStack spacing={2} align="center">
                    <Icon as={selectedIcon} color={selectedColor} boxSize={5} />
                    <Text fontSize="sm" fontWeight="semibold" color={selectedColor}>
                      {selectedOption}
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* See details link */}
              <Link
                color={"primary.700"}
                fontWeight={500}
                display={"flex"}
                gap={1}
                alignItems={"center"}
                isExternal
                href={`${EXPLORER_URL}/transactions/${txId}`}>
                {LL.proposal.see_details()}
                <Icon as={ArrowLinkIcon} width={4} height={4} />
              </Link>
            </VStack>

            {/* Close button */}
            <Button
              onClick={handleClose}
              w="full"
              h={14}
              bg="gray.200"
              color="gray.600"
              fontSize="md"
              fontWeight="semibold"
              borderRadius="lg"
              _hover={{ bg: "gray.300" }}
              _active={{ bg: "gray.300" }}>
              {LL.close()}
            </Button>
          </VStack>
        </ModalBody>
      </ModalSkeleton>
    );
  }

  return (
    <ModalSkeleton
      isOpen={submitVoteModal.isOpen}
      onClose={handleClose}
      trapFocus={false}
      size="xl"
      closeOnOverlayClick={!isTransactionPending}
      showCloseButton={!isTransactionPending}>
      <ModalHeader pb={4}>
        <HStack justify="space-between" align="center" w="full">
          <HStack spacing={3}>
            <Icon as={VoteIcon} boxSize={6} color="primary.500" />
            <Text fontSize="lg" fontWeight={600} color="primary.600">
              {LL.proposal.submit_your_vote()}
            </Text>
          </HStack>
        </HStack>
      </ModalHeader>
      <ModalBody>
        <VStack spacing={6} align="stretch">
          {/* Vote Options */}
          <VStack spacing={3} align="stretch">
            {voteOptions.map((option: SingleChoiceEnum) => {
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
                      <Icon as={icon} color={color} boxSize={5} />
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
                  {LL.your_voting_power()}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight={600} color="gray.500">
                {formattedVotingPower}
              </Text>
            </HStack>
          </Box>
          <GenericInfoBox variant="warning">
            <Text color="orange.700">{LL.proposal.vote_cannot_be_changed()}</Text>
          </GenericInfoBox>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmVote}
            isDisabled={!selectedOption || isTransactionPending}
            isLoading={isTransactionPending}
            loadingText={LL.proposal.waiting_wallet_confirmation()}
            colorScheme="primary"
            size="lg"
            fontSize="md"
            fontWeight={600}
            leftIcon={isTransactionPending ? <Spinner size="sm" /> : <Icon as={CheckIcon} boxSize={4} color="white" />}
            w="full">
            {LL.proposal.confirm_vote()}
          </Button>
        </VStack>
      </ModalBody>
    </ModalSkeleton>
  );
};
