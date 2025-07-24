import { BaseOption, ProposalCardType, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { VotedResult } from "@/types/votes";
import { Flex } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { VotingItem } from "./VotingItem";
import { VotingListFooter } from "./VotingListFooter";
import { VotingTitle } from "./VotingTitle";
import { useVotingBase } from "@/hooks/useVotingBase";
import { SuccessVotingModal } from "./SuccessVotingModal";

type GenericVotingOptions<T, P> = {
  proposal: Omit<ProposalCardType, "votingType" | "votingOptions"> & {
    votingType: T;
    votingOptions: P;
  };
  results?: VotedResult;
};

export const VotingSingleChoice = ({
  proposal,
  results,
}: GenericVotingOptions<VotingEnum.SINGLE_CHOICE, SingleChoiceEnum[]>) => {
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
            kind={VotingEnum.SINGLE_CHOICE}
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

export const VotingSingleOption = ({
  proposal,
  results,
}: GenericVotingOptions<VotingEnum.SINGLE_OPTION, BaseOption[]>) => {
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
    if (!votedChoices?.choices) return [];

    return votedChoices.choices
      .map((choice, i) => (Number(choice) === 1 ? i : null))
      .filter((i): i is number => i !== null);
  }, [votedChoices?.choices]);

  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);
  const currentSelection = useMemo(
    () => initialSelectedOption[0] ?? selectedOption,
    [initialSelectedOption, selectedOption],
  );

  const onSubmit = useCallback(async () => {
    if (currentSelection === undefined) return;

    const options = proposal.votingOptions.map((_, i) => (i === currentSelection ? 1 : 0));

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
    <Flex gap={8} alignItems="start" flexDirection="column" width="100%">
      <VotingTitle />
      <Flex gap={2} alignItems="start" flexDirection="column" width="100%">
        {proposal.votingOptions.map((option, index) => (
          <VotingItem
            key={index}
            label={option.value}
            isSelected={currentSelection === index}
            kind={VotingEnum.SINGLE_OPTION}
            variant={votingVariant}
            choiceIndex={index + 1}
            onClick={() => setSelectedOption(index)}
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

export const VotingMultipleOptions = ({
  proposal,
  results,
}: GenericVotingOptions<VotingEnum.MULTIPLE_OPTIONS, BaseOption[]>) => {
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

  const initialSelectedOptions = useMemo(() => {
    if (!votedChoices?.choices) return [];

    return votedChoices.choices
      .map((choice, i) => (Number(choice) === 1 ? i : null))
      .filter((i): i is number => i !== null);
  }, [votedChoices?.choices]);

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const currentSelection = useMemo(
    () => (initialSelectedOptions.length > 0 ? initialSelectedOptions : selectedOptions),
    [initialSelectedOptions, selectedOptions],
  );

  const handleSelectedOptions = useCallback(
    (index: number) => {
      const maxSelection = proposal.votingLimit ?? 2;

      if (currentSelection.length >= maxSelection && !currentSelection.includes(index)) {
        return;
      }

      setSelectedOptions(prevSelectedOptions => {
        if (prevSelectedOptions.includes(index)) {
          return prevSelectedOptions.filter(option => option !== index);
        } else {
          return [...prevSelectedOptions, index];
        }
      });
    },
    [proposal.votingLimit, currentSelection],
  );

  const onSubmit = useCallback(async () => {
    const options = proposal.votingOptions.map((_, i) => (currentSelection.includes(i) ? 1 : 0));

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
  }, [proposal.votingOptions, proposal.id, currentSelection, sendTransaction, comment, onSuccessOpen]);

  return (
    <Flex gap={8} alignItems="start" flexDirection="column" width="100%">
      <VotingTitle />
      <Flex gap={2} alignItems="start" flexDirection="column" width="100%">
        {proposal.votingOptions.map((option, index) => (
          <VotingItem
            key={index}
            label={option.value}
            isSelected={currentSelection.includes(index)}
            kind={VotingEnum.MULTIPLE_OPTIONS}
            variant={votingVariant}
            choiceIndex={index + 1}
            onClick={() => handleSelectedOptions(index)}
            results={results}
          />
        ))}
      </Flex>
      <VotingListFooter
        onSubmit={onSubmit}
        isLoading={isTransactionPending}
        disabled={currentSelection.length === 0}
        comment={comment}
        setComment={setComment}
        commentDisabled={commentDisabled}
      />
      <SuccessVotingModal isOpen={isSuccessOpen} onClose={onSuccessClose} />
    </Flex>
  );
};
