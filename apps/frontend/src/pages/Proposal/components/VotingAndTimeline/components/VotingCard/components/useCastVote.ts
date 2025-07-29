import { useVotingBase } from "@/hooks/useVotingBase";
import { getIndexFromSingleChoice, getSingleChoiceFromIndex } from "@/utils/proposals/helpers";
import { useCallback, useMemo, useState } from "react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { SingleChoiceEnum } from "@/types/proposal";

export const useCastVote = () => {
  const { proposal } = useProposal();
  const {
    votedChoices,
    votingVariant,
    sendTransaction,
    isTransactionPending,
    isSuccessOpen,
    onSuccessClose,
    onSuccessOpen,
  } = useVotingBase(proposal);

  const [transactionId, setTransactionId] = useState<string | undefined>(undefined);

  const initialSelectedOption = useMemo(() => {
    if (!votedChoices?.choice) return undefined;
    return getSingleChoiceFromIndex(votedChoices.choice);
  }, [votedChoices?.choice]);

  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>(undefined);

  const currentSelection = useMemo(
    () => initialSelectedOption || selectedOption,
    [initialSelectedOption, selectedOption],
  );

  const onSubmit = useCallback(async () => {
    if (!currentSelection) return;

    try {
      const result = await sendTransaction({
        id: proposal.id,
        selectedOption: getIndexFromSingleChoice(currentSelection),
      });
      if (result.txId) {
        setTransactionId(result.txId);
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
  }, [currentSelection, proposal.id, sendTransaction, onSuccessOpen]);

  return {
    onSubmit,
    isLoading: isTransactionPending,
    disabled: currentSelection === undefined,
    isSuccessOpen,
    onSuccessClose,
    transactionId,
    selectedOption,
    setSelectedOption,
    currentSelection,
    votedChoices,
    votingVariant,
  };
};
