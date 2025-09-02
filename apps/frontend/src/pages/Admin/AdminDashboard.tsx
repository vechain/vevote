import { Box, Container, Heading, HStack, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { VeVoteContract } from "./components/Contracts/VeVoteContract";
import { NodeManagement } from "./components/Contracts/NodeManagement";
import { StargateNodes } from "./components/Contracts/StargateNodes";
import { UserManagement } from "./components/Utils/UserManagement";
import { GovernanceSettings } from "./components/Utils/GovernanceSettings";
import { useI18nContext } from "@/i18n/i18n-react";
import { ConnectButton } from "@/components/ui/ConnectButton";

export function AdminDashboard() {
  const { LL } = useI18nContext();

  return (
    <Container maxW="container.xl" py={8}>
      <HStack mb={8} w={"full"} alignItems={"center"}>
        <Heading size="lg">{LL.admin.title()}</Heading>
        <Box ml="auto">
          <ConnectButton />
        </Box>
      </HStack>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>{LL.admin.tabs.contracts()}</Tab>
          <Tab>{LL.admin.tabs.utils()}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Tabs orientation="vertical" variant="line" colorScheme="gray">
              <TabList minW="200px" mr={4}>
                <Tab justifyContent="flex-start">{LL.admin.contracts.vevote()}</Tab>
                <Tab justifyContent="flex-start">{LL.admin.contracts.node_management()}</Tab>
                <Tab justifyContent="flex-start">{LL.admin.contracts.stargate_nodes()}</Tab>
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
                <Tab justifyContent="flex-start">{LL.admin.tabs.users()}</Tab>
                <Tab justifyContent="flex-start">{LL.admin.tabs.governance_settings()}</Tab>
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
