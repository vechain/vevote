import { useI18nContext } from "@/i18n/i18n-react";
import { NodeItem } from "@/types/user";
import { Flex, HStack, Text } from "@chakra-ui/react";
import { useMemo } from "react";

type VotingPowerModalTableProps = {
  nodesList: NodeItem[];
  totalVotingPower: number;
};

export const VotingPowerModalTable = ({ nodesList, totalVotingPower }: VotingPowerModalTableProps) => {
  const shouldScroll = useMemo(() => nodesList.length > 8, [nodesList.length]);

  return (
    <Flex padding={6} borderRadius={12} background={"gray.50"} flexDirection={"column"} gap={2}>
      <NodesHeader />
      <NodesList nodesList={nodesList} />
      <NodesFooter totalVotingPower={totalVotingPower} shouldScroll={shouldScroll} />
    </Flex>
  );
};

const NodesHeader = () => {
  const { LL } = useI18nContext();
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      fontSize={{ base: 12, md: 14 }}
      fontWeight={600}
      color={"gray.500"}
      pr={5}>
      <Text>{LL.node()}</Text>
      <Text>{LL.proposal.voting_power.title()}</Text>
    </Flex>
  );
};

const NodesList = ({ nodesList }: { nodesList: NodeItem[] }) => {
  const shouldScroll = useMemo(() => nodesList.length > 8, [nodesList.length]);

  return (
    <Flex
      flexDirection={"column"}
      borderBottomWidth={1}
      borderColor={"gray.200"}
      maxHeight={shouldScroll ? "200px" : "none"}
      overflowY={shouldScroll ? "auto" : "visible"}
      pr={5}>
      {nodesList.map(({ nodeName, votingPower, count }, index) => (
        <Flex
          key={index}
          alignItems={"center"}
          color={"gray.600"}
          paddingY={1.5}
          gap={8}
          justifyContent={"space-between"}
          fontSize={{ base: 14, md: 16 }}>
          <HStack>
            <Text>{count}</Text>
            <Text>{nodeName}</Text>
          </HStack>
          <Text>{votingPower.toString()}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

const NodesFooter = ({ totalVotingPower, shouldScroll }: { totalVotingPower: number; shouldScroll: boolean }) => {
  const { LL } = useI18nContext();
  return (
    <Flex
      paddingY={1.5}
      color={"gray.600"}
      gap={8}
      fontWeight={600}
      alignItems={"center"}
      justifyContent={"space-between"}
      fontSize={{ base: 14, md: 16 }}
      pr={shouldScroll ? 8 : 5}>
      <Text>{LL.proposal.voting_power.total_voting_power()}</Text>
      <Text>{totalVotingPower}</Text>
    </Flex>
  );
};
