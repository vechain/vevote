import { useI18nContext } from "@/i18n/i18n-react";
import { useProposal } from "./ProposalProvider";
import { useWallet } from "@vechain/vechain-kit";
import { useMemo } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { VotingEnum } from "@/types/proposal";

export const VotingTitle = () => {
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
