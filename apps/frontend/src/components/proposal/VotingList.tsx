import { ProposalCardType, SingleChoiceEnum } from "@/types/proposal";
import { VotedResult } from "@/types/votes";
import { Flex } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { VotingItem } from "./VotingItem";
import { VotingListFooter } from "./VotingListFooter";
import { VotingTitle } from "./VotingTitle";
import { useVotingBase } from "@/hooks/useVotingBase";
import { SuccessVotingModal } from "./SuccessVotingModal";
import { defaultSingleChoice } from "@/pages/CreateProposal/CreateProposalProvider";
import { getIndexFromSingleChoice, getSingleChoiceFromIndex } from "@/utils/proposals/helpers";

type VotingSingleChoiceProps = {
  proposal: ProposalCardType;
  results?: VotedResult;
};

export const VotingSingleChoice = ({ proposal, results }: VotingSingleChoiceProps) => {
  const { votes, votingVariant, sendTransaction, isTransactionPending, isSuccessOpen, onSuccessClose, onSuccessOpen } =
    useVotingBase(proposal);

  const [transactionId, setTransactionId] = useState<string | undefined>(undefined);

  const initialSelectedOption = useMemo(() => {
    if (!votes?.choice) return undefined;
    return getSingleChoiceFromIndex(votes.choice);
  }, [votes?.choice]);

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

  return (
    <Flex gap={{ base: 6, md: 8 }} alignItems="start" flexDirection="column" width="100%">
      <VotingTitle />
      <Flex gap={2} alignItems="start" flexDirection="column" width="100%">
        {defaultSingleChoice.map((option, index) => (
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
      />
      <SuccessVotingModal isOpen={isSuccessOpen} onClose={onSuccessClose} transactionId={transactionId} />
    </Flex>
  );
};
