import { useI18nContext } from "@/i18n/i18n-react";
import { NodeItem } from "@/types/user";
import { Flex, Text } from "@chakra-ui/react";

type VotingPowerModalTableProps = {
  nodesList: NodeItem[];
  totalVotingPower: number;
};

export const VotingPowerModalTable = ({ nodesList, totalVotingPower }: VotingPowerModalTableProps) => {
  return (
    <Flex padding={6} borderRadius={12} background={"gray.50"} flexDirection={"column"} gap={2}>
      <NodesHeader />
      <NodesList nodesList={nodesList} />
      <NodesFooter totalVotingPower={totalVotingPower} />
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
      color={"gray.500"}>
      <Text>{LL.node()}</Text>
      <Text>{LL.proposal.voting_power.title()}</Text>
    </Flex>
  );
};

const NodesList = ({ nodesList }: { nodesList: NodeItem[] }) => {
  return (
    <Flex flexDirection={"column"} borderBottomWidth={1} borderColor={"gray.200"}>
      {nodesList.map(({ multiplier, nodeName, votingPower }, index) => (
        <Flex
          key={index}
          alignItems={"center"}
          color={"gray.600"}
          paddingY={1.5}
          gap={8}
          fontSize={{ base: 14, md: 16 }}>
          <Text minWidth={"30px"}>{`${multiplier}x`}</Text>
          <Text flex={1}>{nodeName}</Text>
          <Text>{votingPower}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

const NodesFooter = ({ totalVotingPower }: { totalVotingPower: number }) => {
  const { LL } = useI18nContext();
  return (
    <Flex
      paddingY={1.5}
      color={"gray.600"}
      gap={8}
      fontWeight={600}
      alignItems={"center"}
      justifyContent={"space-between"}
      fontSize={{ base: 14, md: 16 }}>
      <Text>{LL.proposal.voting_power.total_voting_power()}</Text>
      <Text>{totalVotingPower}</Text>
    </Flex>
  );
};
