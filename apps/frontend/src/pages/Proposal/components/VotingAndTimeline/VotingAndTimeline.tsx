import { Button, Flex, useBreakpointValue, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { VotingCard } from "./components/VotingCard/VotingCard";
import { TimelineCard } from "./components/TimelineCard";

export const VotingAndTimeline = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [activeTab, setActiveTab] = useState<"voting" | "timeline">("voting");

  return (
    <VStack gap={10} width={"full"} align="stretch">
      {/* Mobile tabs */}
      {isMobile && (
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
      )}
      {isMobile && (
        <>
          {activeTab === "voting" && <VotingCard />}
          {activeTab === "timeline" && <TimelineCard />}
        </>
      )}
      {!isMobile && (
        <VStack gap={6}>
          <VotingCard />
          <TimelineCard />
        </VStack>
      )}
    </VStack>
  );
};
