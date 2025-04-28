import { useI18nContext } from "@/i18n/i18n-react";
import { BaseOption, ProposalCardType, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { Flex, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo, useState } from "react";
import { VotingItem, VotingItemVariant } from "./VotingItem";
import { VotingListFooter } from "./VotingListFooter";
import { getVotingVariant } from "@/utils/voting";
import { useProposal } from "./ProposalProvider";

type GenericVotingOptions<T, P> = {
  proposal: Omit<ProposalCardType, "votingType" | "votingOptions"> & {
    votingType: T;
    votingOptions: P;
  };
};

export const VotingSingleChoice = ({
  proposal,
}: GenericVotingOptions<VotingEnum.SINGLE_CHOICE, SingleChoiceEnum[]>) => {
  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>(undefined);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <VotingTitle />
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option}
          isSelected={selectedOption === option}
          kind={VotingEnum.SINGLE_CHOICE}
          variant={votingVariant}
          votes={10}
          onClick={() => setSelectedOption(option)}
        />
      ))}
      <VotingListFooter />
    </Flex>
  );
};

export const VotingSingleOption = ({ proposal }: GenericVotingOptions<VotingEnum.SINGLE_OPTION, BaseOption[]>) => {
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <VotingTitle />
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option.value}
          isSelected={selectedOption === index}
          kind={VotingEnum.SINGLE_OPTION}
          variant={votingVariant}
          votes={10}
          onClick={() => setSelectedOption(index)}
        />
      ))}
      <VotingListFooter />
    </Flex>
  );
};

export const VotingMultipleOptions = ({
  proposal,
}: GenericVotingOptions<VotingEnum.MULTIPLE_OPTIONS, BaseOption[]>) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const handleSelectedOptions = useCallback(
    (index: number) => {
      const maxSelection = proposal.maxSelection;
      if (selectedOptions.length >= maxSelection && !selectedOptions.includes(index)) return;
      setSelectedOptions(prevSelectedOptions => {
        if (prevSelectedOptions.includes(index)) {
          return prevSelectedOptions.filter(option => option !== index);
        } else {
          return [...prevSelectedOptions, index];
        }
      });
    },
    [proposal.maxSelection, selectedOptions],
  );

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <VotingTitle />
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option.value}
          isSelected={selectedOptions.includes(index)}
          kind={VotingEnum.MULTIPLE_OPTIONS}
          variant={votingVariant}
          votes={10}
          onClick={() => handleSelectedOptions(index)}
        />
      ))}
      <VotingListFooter />
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
        {proposal.maxSelection}
      </Text>
      <Text fontWeight={500} color="gray.500">
        {LL.voting_list.option_to_vote()}
      </Text>
    </Flex>
  );
};
