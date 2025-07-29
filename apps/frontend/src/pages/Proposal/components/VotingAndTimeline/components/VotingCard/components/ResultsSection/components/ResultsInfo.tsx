import { Flex, Icon, Text, Button, Link } from "@chakra-ui/react";
import { CircleInfoIcon, CheckCircleIcon, CircleXIcon, AlertTriangleIcon, ArrowLinkIcon } from "@/icons";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { ProposalStatus } from "@/types/proposal";

export const ResultsInfo = () => {
  const { proposal } = useProposal();

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
            Proposal Approved and Executed
          </Text>
          <Text fontSize={"12px"} color={"green.600"}>
            The voting approved the proposal and the actions have been executed.
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
            See details
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
            Proposal Rejected
          </Text>
          <Text fontSize={"12px"} color={"red.600"}>
            The proposal didn't get enough votes in favor to get approval.
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
            Minimum participation not reached
          </Text>
          <Text fontSize={"12px"} color={"red.600"}>
            The voting participation didn't reached the minimum required of 30% to get approval.
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (proposal.status === ProposalStatus.VOTING || proposal.status === ProposalStatus.UPCOMING) {
    return (
      <Flex gap={2} alignItems={"start"}>
        <Icon as={CircleInfoIcon} width={4} height={4} color={"blue.500"} marginTop={"2px"} />
        <Text fontSize={"12px"} color={"blue.700"}>
          A minimum of 30% participation must be reached to validate the voting of the proposal and get approval.
        </Text>
      </Flex>
    );
  }

  return null;
};
