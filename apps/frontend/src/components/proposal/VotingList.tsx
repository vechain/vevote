import { useI18nContext } from "@/i18n/i18n-react";
import { BaseOption, ProposalCardType, ProposalStatus, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { Flex, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo, useState } from "react";
import { VotingItem, VotingItemVariant } from "./VotingItem";
import { VotingListFooter } from "./VotingListFooter";
import { getVotingVariant } from "@/utils/voting";
import { useProposal } from "./ProposalProvider";
import { useCastVote, useVotedChoices } from "@/hooks/useCastVote";
import { VotedResult } from "@/types/votes";

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
  const enabled = useMemo(() => {
    const showResultsArray: ProposalStatus[] = ["approved", "executed", "voting", "rejected"];
    return showResultsArray.includes(proposal.status);
  }, [proposal.status]);

  const { votedChoices } = useVotedChoices({ proposalId: proposal.id, enabled });

  const initialSelectedOption = useMemo(() => {
    return proposal.votingOptions
      .map((option, i) => {
        if (Number(votedChoices?.choices[i] || 0) === 1) return option;
        else return null;
      })
      .filter(p => p !== null);
  }, [proposal.votingOptions, votedChoices?.choices]);

  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>(undefined);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const { sendTransaction, isTransactionPending } = useCastVote({ proposalId: proposal.id });

  const onSubmit = useCallback(async () => {
    const options = proposal.votingOptions.map(o => {
      if (o === selectedOption) return 1;
      else return 0;
    });

    try {
      await sendTransaction({ id: proposal.id, selectedOptions: options });
    } catch (e) {
      console.error(e);
    }
  }, [proposal.id, proposal.votingOptions, selectedOption, sendTransaction]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <VotingTitle />
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option}
          isSelected={(initialSelectedOption[0] || selectedOption) === option}
          kind={VotingEnum.SINGLE_CHOICE}
          variant={votingVariant}
          choiceIndex={index + 1}
          onClick={() => setSelectedOption(option)}
          results={results}
        />
      ))}
      <VotingListFooter onSubmit={onSubmit} isLoading={isTransactionPending} />
    </Flex>
  );
};

export const VotingSingleOption = ({
  proposal,
  results,
}: GenericVotingOptions<VotingEnum.SINGLE_OPTION, BaseOption[]>) => {
  const enabled = useMemo(() => {
    const showResultsArray: ProposalStatus[] = ["approved", "executed", "voting", "rejected"];
    return showResultsArray.includes(proposal.status);
  }, [proposal.status]);

  const { votedChoices } = useVotedChoices({ proposalId: proposal.id, enabled });

  const initialSelectedOption = useMemo(() => {
    if (!votedChoices) return [];
    return proposal.votingOptions
      .map((_, i) => {
        if (Number(votedChoices.choices[i] || 0) === 1) return i;
        else return null;
      })
      .filter(o => o !== null);
  }, [proposal.votingOptions, votedChoices]);

  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const { sendTransaction, isTransactionPending } = useCastVote({ proposalId: proposal.id });

  const onSubmit = useCallback(async () => {
    const options = proposal.votingOptions.map((_, i) => {
      if (i === selectedOption) return 1;
      else return 0;
    });

    try {
      await sendTransaction({ id: proposal.id, selectedOptions: options });
    } catch (e) {
      console.error(e);
    }
  }, [proposal.id, proposal.votingOptions, selectedOption, sendTransaction]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <VotingTitle />
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option.value}
          isSelected={(initialSelectedOption[0] || selectedOption) === index}
          kind={VotingEnum.SINGLE_OPTION}
          variant={votingVariant}
          choiceIndex={index + 1}
          onClick={() => setSelectedOption(index)}
          results={results}
        />
      ))}
      <VotingListFooter onSubmit={onSubmit} isLoading={isTransactionPending} />
    </Flex>
  );
};

export const VotingMultipleOptions = ({
  proposal,
  results,
}: GenericVotingOptions<VotingEnum.MULTIPLE_OPTIONS, BaseOption[]>) => {
  const enabled = useMemo(() => {
    const showResultsArray: ProposalStatus[] = ["approved", "executed", "voting", "rejected"];
    return showResultsArray.includes(proposal.status);
  }, [proposal.status]);

  const { votedChoices } = useVotedChoices({ proposalId: proposal.id, enabled });

  const initialSelectedOption = useMemo(() => {
    if (!votedChoices) return [];
    return proposal.votingOptions
      .map((_, i) => {
        if (Number(votedChoices.choices[i] || 0) === 1) return i;
        else return null;
      })
      .filter(o => o !== null);
  }, [proposal.votingOptions, votedChoices]);

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const handleSelectedOptions = useCallback(
    (index: number) => {
      const maxSelection = proposal.votingLimit ?? 2;
      if (selectedOptions.length >= maxSelection && !selectedOptions.includes(index)) return;
      setSelectedOptions(prevSelectedOptions => {
        if (prevSelectedOptions.includes(index)) {
          return prevSelectedOptions.filter(option => option !== index);
        } else {
          return [...prevSelectedOptions, index];
        }
      });
    },
    [proposal.votingLimit, selectedOptions],
  );

  const { sendTransaction, isTransactionPending } = useCastVote({ proposalId: proposal.id });

  const onSubmit = useCallback(async () => {
    const options = proposal.votingOptions.map((_, i) => {
      if (selectedOptions.includes(i)) return 1;
      else return 0;
    });

    try {
      await sendTransaction({ id: proposal.id, selectedOptions: options });
    } catch (e) {
      console.error(e);
    }
  }, [proposal.id, proposal.votingOptions, selectedOptions, sendTransaction]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <VotingTitle />
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option.value}
          isSelected={(initialSelectedOption || selectedOptions).includes(index)}
          kind={VotingEnum.MULTIPLE_OPTIONS}
          variant={votingVariant}
          choiceIndex={index + 1}
          onClick={() => handleSelectedOptions(index)}
          results={results}
        />
      ))}
      <VotingListFooter onSubmit={onSubmit} isLoading={isTransactionPending} />
    </Flex>
  );
};

const VotingTitle = () => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();
  const { account } = useWallet();

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !account?.address),
    [proposal.status, account?.address],
  );

  if (votingNotStarted) {
    return (
      <Text fontWeight={500} color="gray.500">
        {LL.voting_list.voting_options()}
      </Text>
    );
  }

  if (proposal.votingType !== VotingEnum.MULTIPLE_OPTIONS) {
    return (
      <Flex gap={1}>
        <Text fontWeight={500} color="gray.500">
          {LL.select()}
        </Text>
        <Text color="gray.700" textDecoration={"underline"}>
          {LL.one()}
        </Text>
        <Text fontWeight={500} color="gray.500">
          {LL.voting_list.option_to_vote()}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex gap={1}>
      <Text fontWeight={500} color="gray.500">
        {LL.select_between()}
      </Text>
      <Text color="gray.700" textDecoration={"underline"}>
        {1}
      </Text>
      <Text fontWeight={500} color="gray.500">
        {LL.and()}
      </Text>
      <Text color="gray.700" textDecoration={"underline"}>
        {proposal.votingLimit ?? 2}
      </Text>
      <Text fontWeight={500} color="gray.500">
        {LL.voting_list.option_to_vote()}
      </Text>
    </Flex>
  );
};
