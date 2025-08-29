import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { VeVoteContract } from "./components/Contracts/VeVoteContract";
import { NodeManagement } from "./components/Contracts/NodeManagement";
import { StargateNodes } from "./components/Contracts/StargateNodes";
import { UserManagement } from "./components/Utils/UserManagement";
import { GovernanceSettings } from "./components/Utils/GovernanceSettings";

export function AdminDashboard() {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>
          Admin Dashboard
        </Heading>
      </Box>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Contracts</Tab>
          <Tab>Utils</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Tabs orientation="vertical" variant="line" colorScheme="gray">
              <TabList minW="200px" mr={4}>
                <Tab justifyContent="flex-start">VeVote</Tab>
                <Tab justifyContent="flex-start">Node Management</Tab>
                <Tab justifyContent="flex-start">Stargate Nodes</Tab>
              </TabList>

              <TabPanels flex="1">
                <TabPanel>
                  <VeVoteContract />
                </TabPanel>
                <TabPanel>
                  <NodeManagement />
                </TabPanel>
                <TabPanel>
                  <StargateNodes />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>

          <TabPanel px={0}>
            <Tabs orientation="vertical" variant="line" colorScheme="gray">
              <TabList minW="200px" mr={4}>
                <Tab justifyContent="flex-start">Users</Tab>
                <Tab justifyContent="flex-start">Governance Settings</Tab>
              </TabList>

              <TabPanels flex="1">
                <TabPanel>
                  <UserManagement />
                </TabPanel>
                <TabPanel>
                  <GovernanceSettings />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}