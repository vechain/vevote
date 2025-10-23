import { useProposal } from "@/components/proposal/ProposalProvider";
import { ExecutedInfoBox, InfoBox } from "@/components/ui/InfoBox";
import { useTotalVotes } from "@/hooks/useCastVote";
import { useGetDatesBlocks } from "@/hooks/useGetDatesBlocks";
import { useQuorum } from "@/hooks/useQuorum";
import { useI18nContext } from "@/i18n/i18n-react";
import { CircleInfoIcon } from "@/icons";
import { ProposalStatus } from "@/types/proposal";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";

export const ResultsInfo = () => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();

  const { startBlock } = useGetDatesBlocks({
    startDate: proposal.startDate,
  });

  const { quorumPercentage } = useQuorum(startBlock);
  const { totalVotes } = useTotalVotes({ proposalId: proposal.id });

  const isQuorumReached = useMemo(() => {
    return totalVotes >= quorumPercentage;
  }, [quorumPercentage, totalVotes]);

  if (proposal.status === ProposalStatus.APPROVED) {
    return (
      <InfoBox variant="approved" border={"none"} bg={"transparent"} paddingX={0} paddingY={0}>
        <Text fontSize={"12px"} color={"green.600"}>
          {LL.proposal.proposal_approved()}
        </Text>
      </InfoBox>
    );
  }

  if (proposal.status === ProposalStatus.EXECUTED) {
    return <ExecutedInfoBox executedProposalLink={proposal.executedProposalLink} />;
  }

  if (proposal.status === ProposalStatus.REJECTED) {
    return (
      <InfoBox variant="rejected">
        <Flex direction={"column"} gap={1}>
          <Text fontSize={"14px"} fontWeight={500} color={"red.700"}>
            {LL.proposal.proposal_rejected()}
          </Text>
          <Text fontSize={"12px"} color={"gray.600"}>
            {LL.proposal.the_proposal_didnt_get_enough_votes_in_favor_to_get_approval()}
          </Text>
        </Flex>
      </InfoBox>
    );
  }

  if (proposal.status === ProposalStatus.MIN_NOT_REACHED) {
    return (
      <InfoBox variant="min-not-reached">
        <Flex direction={"column"} gap={1}>
          <Text fontSize={"14px"} fontWeight={500} color={"red.700"}>
            {LL.proposal.minimum_quorum_not_reached()}
          </Text>
          <Text fontSize={"12px"} color={"gray.600"}>
            {LL.proposal.quorum_not_reached({
              quorum: quorumPercentage.toLocaleString(),
            })}
          </Text>
        </Flex>
      </InfoBox>
    );
  }

  if (proposal.status === ProposalStatus.VOTING) {
    if (isQuorumReached)
      return (
        <Flex gap={2} alignItems={"start"}>
          <Icon as={CircleInfoIcon} boxSize={4} color={"green.500"} />
          <Text fontSize={"12px"} color={"green.700"}>
            {LL.proposal.quorum_reached()}
          </Text>
        </Flex>
      );
    return (
      <Flex gap={2} alignItems={"center"}>
        <Icon as={CircleInfoIcon} boxSize={4} color={"blue.500"} />
        <Text fontSize={"12px"} color={"blue.700"}>
          {LL.proposal.quorum_not_reached_yet({ quorum: quorumPercentage?.toLocaleString() })}
        </Text>
      </Flex>
    );
  }

  return null;
};
