import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { Flex, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useCallback, useMemo, useState } from "react";
import { VotingItem, VotingItemVariant } from "./VotingItem";
import { VotingListFooter } from "./VotingListFooter";

//todo: MOVE TO UTILS
const getVotingVariant = (proposalStatus: string): VotingItemVariant => {
  switch (proposalStatus) {
    case "upcoming":
      return "upcoming";
    case "voting":
      return "voting";
    case "approved":
    case "executed":
      return "result-win";
    default:
      return "result-lost";
  }
};

type VotingSingleChoiceProps = {
  proposal: Omit<ProposalCardType, "votingType" | "votingOptions"> & {
    votingType: VotingEnum.SINGLE_CHOICE;
    votingOptions: SingleChoiceEnum[];
  };
};

type VotingSingleOptionProps = {
  proposal: Omit<ProposalCardType, "votingType" | "votingOptions"> & {
    votingType: VotingEnum.SINGLE_OPTION;
    votingOptions: string[];
  };
};

type VotingMultipleOptionsProps = {
  proposal: Omit<ProposalCardType, "votingType" | "votingOptions"> & {
    votingType: VotingEnum.MULTIPLE_OPTIONS;
    votingOptions: string[];
  };
};

export const VotingSingleChoice = ({ proposal }: VotingSingleChoiceProps) => {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  const [selectedOption, setSelectedOption] = useState<SingleChoiceEnum | undefined>(undefined);

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !account?.address),
    [proposal.status, account?.address],
  );

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <Text fontWeight={500} color="gray.500">
        {votingNotStarted ? LL.voting_list.voting_options() : <VotingTitle proposal={proposal} />}
      </Text>
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
      <VotingListFooter proposal={proposal} votingNotStarted={votingNotStarted} votingVariant={votingVariant} />
    </Flex>
  );
};

export const VotingSingleOption = ({ proposal }: VotingSingleOptionProps) => {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !account?.address),
    [proposal.status, account?.address],
  );

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <Text fontWeight={500} color="gray.500">
        {votingNotStarted ? LL.voting_list.voting_options() : <VotingTitle proposal={proposal} />}
      </Text>
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option}
          isSelected={selectedOption === index}
          kind={VotingEnum.SINGLE_OPTION}
          variant={votingVariant}
          votes={10}
          onClick={() => setSelectedOption(index)}
        />
      ))}
      <VotingListFooter proposal={proposal} votingNotStarted={votingNotStarted} votingVariant={votingVariant} />
    </Flex>
  );
};

export const VotingMultipleOptions = ({ proposal }: VotingMultipleOptionsProps) => {
  const { LL } = useI18nContext();
  const { account } = useWallet();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !account?.address),
    [proposal.status, account?.address],
  );

  const votingVariant: VotingItemVariant = useMemo(() => getVotingVariant(proposal.status), [proposal.status]);

  const handleSelectedOptions = useCallback((index: number) => {
    setSelectedOptions(prevSelectedOptions => {
      if (prevSelectedOptions.includes(index)) {
        return prevSelectedOptions.filter(option => option !== index);
      } else {
        return [...prevSelectedOptions, index];
      }
    });
  }, []);

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <Text fontWeight={500} color="gray.500">
        {votingNotStarted ? LL.voting_list.voting_options() : <VotingTitle proposal={proposal} />}
      </Text>
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option}
          isSelected={selectedOptions.includes(index)}
          kind={VotingEnum.MULTIPLE_OPTIONS}
          variant={votingVariant}
          votes={10}
          onClick={() => handleSelectedOptions(index)}
        />
      ))}
      <VotingListFooter proposal={proposal} votingNotStarted={votingNotStarted} votingVariant={votingVariant} />
    </Flex>
  );
};

const VotingTitle = ({ proposal }: { proposal: ProposalCardType }) => {
  const { LL } = useI18nContext();

  if (proposal.votingType !== VotingEnum.MULTIPLE_OPTIONS) {
    return (
      <Flex gap={1}>
        {LL.select()}
        <Text color="gray.700" textDecoration={"underline"}>
          {LL.one()}
        </Text>
        {LL.voting_list.option_to_vote()}
      </Flex>
    );
  }
  return (
    <Flex gap={1}>
      {LL.select_between()}
      <Text color="gray.700" textDecoration={"underline"}>
        {1}
      </Text>
      {LL.and()}
      <Text color="gray.700" textDecoration={"underline"}>
        {proposal.maxSelection}
      </Text>
      {LL.voting_list.option_to_vote()}
    </Flex>
  );
};
