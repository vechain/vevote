import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType, SingleChoiceEnum, VotingEnum } from "@/types/proposal";
import { Flex, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useMemo, useState } from "react";
import { VotingItem } from "./VotingItem";

type VotingSingleChoiceProps = {
  proposal: Omit<ProposalCardType, "votingType" | "votingOptions"> & {
    votingType: VotingEnum.SINGLE_CHOICE;
    votingOptions: SingleChoiceEnum[];
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

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"} width={"100%"}>
      <Text fontWeight={500} color="gray.500">
        {votingNotStarted ? LL.voting_list.voting_options() : <VotingTitle />}
      </Text>
      {proposal.votingOptions.map((option, index) => (
        <VotingItem
          key={index}
          label={option}
          isSelected={selectedOption === option}
          kind={VotingEnum.SINGLE_CHOICE}
          variant={"voting"}
          votes={10}
          onClick={() => setSelectedOption(option)}
        />
      ))}
    </Flex>
  );
};

const VotingTitle = () => {
  const { LL } = useI18nContext();

  return (
    <Flex>
      {LL.select()}{" "}
      <Text color="gray.700" textDecoration={"underline"}>
        {LL.voting_list.voting_options()}{" "}
      </Text>
      {LL.voting_list.option_to_vote()}
    </Flex>
  );
};
