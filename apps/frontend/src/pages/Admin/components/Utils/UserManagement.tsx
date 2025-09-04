import { HStack, useBreakpointValue } from "@chakra-ui/react";
import { UserManagementCard } from "../Users/UserManagementCard";
import { VotingPowerAtTimepointCard } from "../Users/VotingPowerAtTimepointCard";

export function UserManagement() {
  const stackSpacing = useBreakpointValue({
    base: 4,
    md: 6,
  });

  return (
    <HStack spacing={stackSpacing} align="flex-start" wrap="wrap">
      <UserManagementCard />
      <VotingPowerAtTimepointCard />
    </HStack>
  );
}
