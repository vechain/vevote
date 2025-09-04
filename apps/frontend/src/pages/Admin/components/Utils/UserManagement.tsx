import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { RoleUsersCard } from "../Users/RoleUsersCard";
import { UserManagementCard } from "../Users/UserManagementCard";
import { VotingPowerAtTimepointCard } from "../Users/VotingPowerAtTimepointCard";

export function UserManagement() {
  const stackSpacing = useBreakpointValue({
    base: 4,
    md: 6,
  });

  return (
    <Flex
      gap={stackSpacing}
      alignItems={"start"}
      justifyContent={"space-between"}
      flexDirection={{ base: "column", xl: "row" }}>
      <Flex gap={stackSpacing} alignItems={"start"} flexDirection={{ base: "column", md: "row" }}>
        <UserManagementCard />
        <RoleUsersCard />
      </Flex>
      <VotingPowerAtTimepointCard />
    </Flex>
  );
}
