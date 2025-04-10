import { Button, Flex, Link, ModalBody, ModalHeader, Text, useDisclosure } from "@chakra-ui/react";
import { MdOutlineHowToVote } from "react-icons/md";
import { ModalSkeleton, ModalTitle } from "../ui/ModalSkeleton";
import { CopyLink } from "../ui/CopyLink";
import { useWallet } from "@vechain/vechain-kit";
import { formatAddress } from "@/utils/address";
import { MdOutlineArrowOutward } from "react-icons/md";
import { useMemo } from "react";

const VECHAIN_EXPLORER_URL = "https://explore-testnet.vechain.org"; //todo: add env variable

type NodeItemType = {
  multiplier: number;
  nodeName: string;
  votingPower: number;
};
type NodesList = NodeItemType[];

export const VotingPowerModal = ({ votingPower }: { votingPower: number }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const nodesList = useMemo(
    () => [
      {
        multiplier: 1,
        nodeName: "Thunder X",
        votingPower: 840,
      },
      {
        multiplier: 2,
        nodeName: "Majolnir",
        votingPower: 3000,
      },
      {
        multiplier: 1,
        nodeName: "Validator",
        votingPower: 5000,
      },
    ],
    [],
  );

  const totalVotingPower = useMemo(() => {
    return nodesList.reduce((acc, node) => acc + node.votingPower, 0);
  }, [nodesList]);

  const block = useMemo(
    () => ({
      id: "0x0146e719f72cf2ef3e7baaefcb3a96c6d6c9d13111c2610155241ff634c5f80a",
      number: "21.423.897",
    }),
    [],
  );

  return (
    <>
      <Button onClick={onOpen} variant={"secondary"}>
        <MdOutlineHowToVote size={20} />
        {votingPower}
      </Button>
      <ModalSkeleton isOpen={isOpen} onClose={onClose}>
        <ModalHeader>
          <ModalTitle title={"Voting Power"} icon={MdOutlineHowToVote} />
        </ModalHeader>
        <ModalBody>
          <Flex flexDirection={"column"} gap={8}>
            <VotingWallet />

            <Flex flexDirection={"column"} gap={3}>
              <Flex padding={6} borderRadius={12} background={"gray.50"} flexDirection={"column"} gap={2}>
                <NodesHeader />
                <NodesList nodesList={nodesList} />
                <NodesFooter totalVotingPower={totalVotingPower} />
              </Flex>
              <Flex padding={4} borderRadius={12} background={"primary.100"} flexDirection={"column"} gap={3}>
                <Text fontSize={14} color={"gray.600"}>
                  {"Your voting power was calculated at the time of the snapshot 29/03/2025 - 00h00m."}
                </Text>
                <Text color={"gray.600"} fontWeight={500} display={"flex"} gap={2} alignItems={"center"}>
                  {"Block #"}
                  <Link
                    display={"flex"}
                    gap={2}
                    alignItems={"center"}
                    color={"primary.500"}
                    fontWeight={500}
                    isExternal
                    href={`${VECHAIN_EXPLORER_URL}/blocks/${block.id}`}>
                    {block.number}
                    <MdOutlineArrowOutward />
                  </Link>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalSkeleton>
    </>
  );
};

const VotingWallet = () => {
  const { account } = useWallet();

  return (
    <Text display={"inline-flex"} alignItems={"center"} gap={2} color={"gray.600"}>
      {"Wallet:"}
      <CopyLink isExternal textToCopy={account?.address} color={"primary.500"} fontWeight={500}>
        {formatAddress(account?.address || "")}
      </CopyLink>
    </Text>
  );
};

const NodesHeader = () => {
  return (
    <Flex alignItems={"center"} justifyContent={"space-between"} fontSize={14} fontWeight={600} color={"gray.500"}>
      <Text>{"Node"}</Text>
      <Text>{"Voting Power"}</Text>
    </Flex>
  );
};

const NodesList = ({ nodesList }: { nodesList: NodesList }) => {
  return (
    <Flex flexDirection={"column"} borderBottomWidth={1} borderColor={"gray.200"}>
      {nodesList.map((node, index) => (
        <NodeItem key={index} multiplier={node.multiplier} nodeName={node.nodeName} votingPower={node.votingPower} />
      ))}
    </Flex>
  );
};

const NodeItem = ({
  multiplier,
  nodeName,
  votingPower,
}: {
  multiplier: number;
  nodeName: string;
  votingPower: number;
}) => {
  return (
    <Flex alignItems={"center"} color={"gray.600"} paddingY={1.5} gap={8}>
      <Text>{`${multiplier}x`}</Text>
      <Text flex={1}>{nodeName}</Text>
      <Text>{votingPower}</Text>
    </Flex>
  );
};

const NodesFooter = ({ totalVotingPower }: { totalVotingPower: number }) => {
  return (
    <Flex
      paddingY={1.5}
      color={"gray.600"}
      gap={8}
      fontWeight={600}
      alignItems={"center"}
      justifyContent={"space-between"}>
      <Text>{"Total Voting Power"}</Text>
      <Text>{totalVotingPower}</Text>
    </Flex>
  );
};
