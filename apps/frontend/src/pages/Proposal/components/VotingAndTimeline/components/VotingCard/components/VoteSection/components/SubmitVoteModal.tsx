import { BaseModalContent } from "@/components/ui/BaseModalContent";
import {
  Modal,
  ModalHeader,
  ModalOverlay,
  UseDisclosureReturn,
  ModalBody,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Box,
  Radio,
  ModalCloseButton,
  Spinner,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { SingleChoiceEnum } from "@/types/proposal";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { ThumbsUpIcon, ThumbsDownIcon, AbstainIcon, VoteIcon, CheckIcon, VotingPowerIcon } from "@/icons";
import { useNodes } from "@/hooks/useUserQueries";

const IconByVote = {
  [SingleChoiceEnum.FOR]: <ThumbsUpIcon width="20px" height="20px" />,
  [SingleChoiceEnum.AGAINST]: <ThumbsDownIcon width="20px" height="20px" />,
  [SingleChoiceEnum.ABSTAIN]: <AbstainIcon width="20px" height="20px" />,
};

const ColorByVote = {
  [SingleChoiceEnum.FOR]: "green.600",
  [SingleChoiceEnum.AGAINST]: "red.600",
  [SingleChoiceEnum.ABSTAIN]: "orange.400",
};

export const SubmitVoteModal = ({ submitVoteModal }: { submitVoteModal: UseDisclosureReturn }) => {
  const { nodes } = useNodes();
  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalVotingPower = useMemo(() => {
    return nodes.reduce((acc, node) => acc + Number(node.votingPower) / 100, 0);
  }, [nodes]);

  const formattedVotingPower = useMemo(() => {
    return new Intl.NumberFormat().format(totalVotingPower);
  }, [totalVotingPower]);

  const handleConfirmVote = async () => {
    if (!selectedOption) return;

    setIsLoading(true);

    // Map vote option to index for the smart contract
    const voteIndex = defaultSingleChoice.indexOf(selectedOption);

    // Close the modal after selection - in real implementation, this would trigger the actual voting
    console.log("Vote submitted:", selectedOption, "Index:", voteIndex);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <Modal isOpen={true} onClose={submitVoteModal.onClose} trapFocus={false} size="md">
        <ModalOverlay bg="blackAlpha.600" />
        <BaseModalContent>
          <ModalCloseButton position="absolute" top={6} right={6} size="lg" onClick={submitVoteModal.onClose} />
        </BaseModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={submitVoteModal.onClose} trapFocus={false} size="md">
      <ModalOverlay bg="blackAlpha.600" />
      <BaseModalContent>
        <ModalCloseButton position="absolute" top={6} right={6} size="lg" onClick={submitVoteModal.onClose} />
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

        <ModalBody pb={6}>
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
                    onClick={() => setSelectedOption(option)}
                    p={4}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={isSelected ? color : "gray.200"}
                    bg={"white"}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: color,
                      bg: `${color.split(".")[0]}.50`,
                    }}
                    cursor="pointer">
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={() => icon} color={color} boxSize={5} />
                        <Text fontSize="md" fontWeight={isSelected ? 600 : 500} color={color}>
                          {option}
                        </Text>
                      </HStack>
                      <Radio isChecked={isSelected} colorScheme={color.split(".")[0]} pointerEvents="none" />
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
              isDisabled={!selectedOption || isLoading}
              isLoading={isLoading}
              loadingText="Waiting wallet confirmation..."
              colorScheme="primary"
              size="lg"
              fontSize="md"
              fontWeight={600}
              leftIcon={isLoading ? <Spinner size="sm" /> : <Icon as={CheckIcon} boxSize={4} color="white" />}
              w="full">
              Confirm vote
            </Button>
          </VStack>
        </ModalBody>
      </BaseModalContent>
    </Modal>
  );
};
