import { Button, Flex, Text, Icon, useBreakpointValue, Box } from "@chakra-ui/react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { VoteIcon, ClockIcon, CircleInfoIcon } from "@/icons";
import { useState } from "react";

export const NewVotingCard = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [activeTab, setActiveTab] = useState<"voting" | "timeline">("voting");

  if (isMobile) {
    return (
      <Flex flexDirection={"column"} gap={6} width={"100%"}>
        {/* Mobile tabs */}
        <Flex borderBottom={"1px solid"} borderColor={"gray.200"}>
          <Button
            variant={"ghost"}
            flex={1}
            padding={"8px 16px"}
            borderRadius={0}
            borderBottom={activeTab === "voting" ? "2px solid" : "none"}
            borderColor={activeTab === "voting" ? "primary.500" : "transparent"}
            color={activeTab === "voting" ? "primary.600" : "gray.600"}
            fontWeight={600}
            fontSize={"14px"}
            onClick={() => setActiveTab("voting")}>
            Voting
          </Button>
          <Button
            variant={"ghost"}
            flex={1}
            padding={"8px 16px"}
            borderRadius={0}
            borderBottom={activeTab === "timeline" ? "2px solid" : "none"}
            borderColor={activeTab === "timeline" ? "primary.500" : "transparent"}
            color={activeTab === "timeline" ? "primary.600" : "gray.600"}
            fontWeight={600}
            fontSize={"14px"}
            onClick={() => setActiveTab("timeline")}>
            Timeline
          </Button>
        </Flex>

        {/* Mobile card content */}
        {activeTab === "voting" && <VotingCardContent />}
        {activeTab === "timeline" && <TimelineCardContent />}
      </Flex>
    );
  }

  return <VotingCardContent />;
};

const VotingCardContent = () => {
  const { proposal } = useProposal();
  const isUpcoming = proposal.status === "upcoming";

  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      width={"100%"}
      minWidth={{ base: "auto", md: "480px" }}>
      {/* Countdown section */}
      <Flex
        flexDirection={"column"}
        gap={4}
        padding={{ base: "16px", md: "24px" }}
        borderBottom={"1px solid"}
        borderColor={"gray.200"}>
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Flex alignItems={"center"} gap={3}>
            <Icon as={ClockIcon} width={5} height={5} color={"primary.700"} />
            <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
              {isUpcoming ? "Starts in" : "Ends in"}
            </Text>
          </Flex>
        </Flex>

        <Flex gap={2} justifyContent={"space-between"}>
          <CountdownBox value={0} label="days" />
          <CountdownBox value={0} label="hours" />
          <CountdownBox value={0} label="minutes" />
        </Flex>
      </Flex>

      {/* Results section */}
      <Flex
        flexDirection={"column"}
        gap={6}
        padding={{ base: "16px", md: "24px" }}
        borderBottom={"1px solid"}
        borderColor={"gray.200"}>
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Flex alignItems={"center"} gap={3}>
            <Icon as={VoteIcon} width={5} height={5} color={"primary.700"} />
            <Text fontWeight={600} color={"primary.700"} fontSize={{ base: "14px", md: "16px" }}>
              Results
            </Text>
          </Flex>
        </Flex>

        <VotingResults />

        {/* Info alert */}
        <Flex gap={2} alignItems={"start"}>
          <Icon as={CircleInfoIcon} width={4} height={4} color={"blue.500"} marginTop={"2px"} />
          <Text fontSize={"12px"} color={"blue.700"}>
            A minimum of 30% participation must be reached to validate the voting of the proposal and get approval.
          </Text>
        </Flex>
      </Flex>

      {/* Vote button section */}
      <Flex flexDirection={"column"} gap={6} padding={{ base: "16px", md: "24px" }}>
        <VoteButton />
      </Flex>
    </Flex>
  );
};

const CountdownBox = ({ value, label }: { value: number; label: string }) => {
  return (
    <Flex
      flexDirection={"column"}
      alignItems={"center"}
      backgroundColor={"gray.50"}
      padding={"8px 12px"}
      borderRadius={8}
      flex={1}>
      <Text fontWeight={600} fontSize={"16px"} color={"gray.600"}>
        {value.toString().padStart(label === "days" ? 3 : 2, "X")}
      </Text>
      <Text fontWeight={500} fontSize={"12px"} color={"gray.600"}>
        {label}
      </Text>
    </Flex>
  );
};

const VotingResults = () => {
  const voteOptions = ["Yes", "Abstain", "No"];
  const colors = ["green.500", "orange.300", "red.600"];

  return (
    <Flex flexDirection={"column"} gap={4}>
      {/* Progress bar */}
      <Flex height={"8px"} borderRadius={8} overflow={"hidden"} backgroundColor={"gray.200"}>
        <Box flex={1} backgroundColor={colors[0]} />
        <Box width={"27px"} backgroundColor={colors[1]} />
        <Box width={"35px"} backgroundColor={colors[2]} />
      </Flex>

      {/* Vote percentages */}
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        {voteOptions.map((option, index) => (
          <Flex key={option} alignItems={"center"} gap={2}>
            <Flex width={"24px"} height={"24px"} backgroundColor={colors[index]} borderRadius={4} />
            <Text fontSize={{ base: "14px", md: "16px" }} color={"gray.600"}>
              XX%
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

const VoteButton = () => {
  const { proposal } = useProposal();
  const isUpcoming = proposal.status === "upcoming";

  return (
    <Button
      width={"100%"}
      height={"56px"}
      backgroundColor={isUpcoming ? "primary.100" : "primary.500"}
      color={isUpcoming ? "primary.300" : "white"}
      fontWeight={600}
      fontSize={"16px"}
      borderRadius={8}
      isDisabled={isUpcoming}
      _hover={{
        backgroundColor: isUpcoming ? "primary.100" : "primary.600",
      }}>
      Submit your vote
    </Button>
  );
};

// Placeholder for timeline content in mobile view
const TimelineCardContent = () => {
  return (
    <Flex
      flexDirection={"column"}
      backgroundColor={"white"}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={16}
      padding={"16px"}>
      <Text>Timeline content will be shown here</Text>
    </Flex>
  );
};
