import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalCardType } from "@/types/proposal";
import { Flex, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { useMemo } from "react";

export const VotingSingleChoice = ({ proposal }: { proposal: ProposalCardType }) => {
  const { LL } = useI18nContext();
  const { account } = useWallet();

  const votingNotStarted = useMemo(
    () => proposal.status === "upcoming" || (proposal.status === "voting" && !account?.address),
    [proposal.status, account?.address],
  );

  const VotingTitle = () => {
    return (
      <>
        {LL.select()}{" "}
        <Text color="gray.700" textDecoration={"underline"}>
          {LL.voting_list.voting_options()}{" "}
        </Text>
        {LL.voting_list.option_to_vote()}
      </>
    );
  };

  return (
    <Flex gap={8} alignItems={"start"} flexDirection={"column"}>
      <Text fontWeight={500} color="gray.500">
        {votingNotStarted ? LL.voting_list.voting_options() : <VotingTitle />}
      </Text>
    </Flex>
  );
};
