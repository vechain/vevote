import { ProposalCardType, SingleChoiceEnum } from "@/types/proposal";
import { VotedResult } from "@/types/votes";
import { Flex } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { VotingItem } from "./VotingItem";
import { VotingListFooter } from "./VotingListFooter";
import { VotingTitle } from "./VotingTitle";
import { useVotingBase } from "@/hooks/useVotingBase";
import { SuccessVotingModal } from "./SuccessVotingModal";

type VotingSingleChoiceProps = {
  proposal: ProposalCardType;
  results?: VotedResult;
};

export const VotingSingleChoice = ({ proposal, results }: VotingSingleChoiceProps) => {
  const {
    votedChoices,
    votingVariant,
    sendTransaction,
    isTransactionPending,
    comment,
    setComment,
    commentDisabled,
    isSuccessOpen,
    onSuccessClose,
    onSuccessOpen,
  } = useVotingBase(proposal);

  const initialSelectedOption = useMemo(() => {
    if (!votedChoices?.choices) return undefined;

    const selectedIndex = votedChoices.choices.findIndex(choice => Number(choice) === 1);
    return selectedIndex >= 0 ? proposal.votingOptions[selectedIndex] : undefined;
  }, [proposal.votingOptions, votedChoices?.choices]);

  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>(undefined);
  const currentSelection = useMemo(
    () => initialSelectedOption || selectedOption,
    [initialSelectedOption, selectedOption],
  );

  const onSubmit = useCallback(async () => {
    if (!currentSelection) return;

    const options = proposal.votingOptions.map(option => (option === currentSelection ? 1 : 0));

    try {
      const result = await sendTransaction({ id: proposal.id, selectedOptions: options, reason: comment });
      if (result.txId) {
        onSuccessOpen();
        console.log("Vote successful! Transaction ID:", result.txId);
      }
    } catch (e) {
      const txError = e as { txId?: string; error?: { message?: string }; message?: string };
      console.error("Vote failed:", txError.error?.message || txError.message);
      if (txError.txId) {
        console.log("Failed transaction ID:", txError.txId);
      }
    }
  }, [currentSelection, proposal.votingOptions, proposal.id, sendTransaction, comment, onSuccessOpen]);

  return (
    <Flex gap={{ base: 6, md: 8 }} alignItems="start" flexDirection="column" width="100%">
      <VotingTitle />
      <Flex gap={2} alignItems="start" flexDirection="column" width="100%">
        {proposal.votingOptions.map((option, index) => (
          <VotingItem
            key={index}
            label={option}
            isSelected={currentSelection === option}
            variant={votingVariant}
            choiceIndex={index + 1}
            onClick={() => setSelectedOption(option)}
            results={results}
          />
        ))}
      </Flex>
      <VotingListFooter
        onSubmit={onSubmit}
        isLoading={isTransactionPending}
        disabled={currentSelection === undefined}
        comment={comment}
        setComment={setComment}
        commentDisabled={commentDisabled}
      />
      <SuccessVotingModal isOpen={isSuccessOpen} onClose={onSuccessClose} />
    </Flex>
  );
};
