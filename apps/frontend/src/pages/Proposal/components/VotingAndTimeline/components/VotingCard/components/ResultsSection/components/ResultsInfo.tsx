import { Flex, Icon, Text, Button, Link } from "@chakra-ui/react";
import { CircleInfoIcon, CheckCircleIcon, CircleXIcon, AlertTriangleIcon, ArrowLinkIcon } from "@/icons";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { ProposalStatus } from "@/types/proposal";
import { useI18nContext } from "@/i18n/i18n-react";
import { useQuorum } from "@/hooks/useQuorum";
import { useGetDatesBlocks } from "@/hooks/useGetDatesBlocks";
import { useMemo } from "react";

export const ResultsInfo = ({ reachedVotingPower }: { reachedVotingPower: number }) => {
  const { proposal } = useProposal();
  const { LL } = useI18nContext();

  const { startBlock } = useGetDatesBlocks({
    startDate: proposal.startDate,
  });

  const { quorumPercentage } = useQuorum(startBlock);

  const isQuorumReached = useMemo(() => {
    return reachedVotingPower >= quorumPercentage;
  }, [quorumPercentage, reachedVotingPower]);

  if (proposal.status === ProposalStatus.EXECUTED) {
    return (
      <Flex
        gap={3}
        alignItems={"start"}
        p={4}
        bg={"green.50"}
        borderRadius={8}
        border={"1px solid"}
        borderColor={"green.200"}>
        <Icon as={CheckCircleIcon} width={5} height={5} color={"green.500"} marginTop={"2px"} />
        <Flex flex={1} direction={"column"} gap={2}>
          <Text fontSize={"14px"} fontWeight={500} color={"green.700"}>
            {LL.proposal.proposal_approved_and_executed()}
          </Text>
          <Text fontSize={"12px"} color={"green.600"}>
            {LL.proposal.the_voting_approved_the_proposal_and_the_actions_have_been_executed()}
          </Text>
        </Flex>
        {proposal.executedProposalLink && (
          <Button
            as={Link}
            size={"sm"}
            variant={"ghost"}
            colorScheme={"green"}
            rightIcon={<Icon as={ArrowLinkIcon} />}
            href={proposal.executedProposalLink}
            isExternal>
            {LL.proposal.see_details()}
          </Button>
        )}
      </Flex>
    );
  }

  if (proposal.status === ProposalStatus.REJECTED) {
    return (
      <Flex
        gap={3}
        alignItems={"start"}
        p={4}
        bg={"red.50"}
        borderRadius={8}
        border={"1px solid"}
        borderColor={"red.200"}>
        <Icon as={CircleXIcon} width={5} height={5} color={"red.500"} marginTop={"2px"} />
        <Flex direction={"column"} gap={1}>
          <Text fontSize={"14px"} fontWeight={500} color={"red.700"}>
            {LL.proposal.proposal_rejected()}
          </Text>
          <Text fontSize={"12px"} color={"red.600"}>
            {LL.proposal.the_proposal_didnt_get_enough_votes_in_favor_to_get_approval()}
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (proposal.status === ProposalStatus.MIN_NOT_REACHED) {
    return (
      <Flex
        gap={3}
        alignItems={"start"}
        p={4}
        bg={"red.50"}
        borderRadius={8}
        border={"1px solid"}
        borderColor={"red.200"}>
        <Icon as={AlertTriangleIcon} width={5} height={5} color={"red.500"} marginTop={"2px"} />
        <Flex direction={"column"} gap={1}>
          <Text fontSize={"14px"} fontWeight={500} color={"red.700"}>
            {LL.proposal.minimum_quorum_not_reached()}
          </Text>
          <Text fontSize={"12px"} color={"red.600"}>
            {LL.proposal.quorum_not_reached({
              quorum: quorumPercentage.toLocaleString(),
            })}
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (proposal.status === ProposalStatus.VOTING) {
    if (isQuorumReached) {
      <Flex gap={2} alignItems={"start"}>
        <Icon as={CircleInfoIcon} width={4} height={4} color={"green.500"} marginTop={"2px"} />
        <Text fontSize={"12px"} color={"green.700"}>
          {LL.proposal.quorum_reached()}
        </Text>
      </Flex>;
    }
    return (
      <Flex gap={2} alignItems={"start"}>
        <Icon as={CircleInfoIcon} width={4} height={4} color={"blue.500"} marginTop={"2px"} />
        <Text fontSize={"12px"} color={"blue.700"}>
          {LL.proposal.quorum_not_reached_yet({ quorum: quorumPercentage?.toLocaleString() })}
        </Text>
      </Flex>
    );
  }

  return null;
};
