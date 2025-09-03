import { useState } from "react";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, useBreakpointValue } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useResponsiveNavigation } from "../../hooks/useResponsiveNavigation";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { ResponsiveHeader } from "./ResponsiveHeader";

interface ResponsiveNavigationProps {
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
}

// Define semantic keys for each content type to avoid using array indices
const contractKeys = ["vevote-contract", "node-management", "stargate-nodes"];
const utilsKeys = ["user-management", "governance-settings"];

export function ResponsiveNavigation({ contractsContent, utilsContent }: ResponsiveNavigationProps) {
  const { LL } = useI18nContext();
  const { showVerticalTabs, showHorizontalTabs, showMobileDrawer, drawerState } = useResponsiveNavigation();

  const sidebarWidth = useBreakpointValue({
    base: "150px",
    md: "180px",
    lg: "200px",
  });

  const sidebarMargin = useBreakpointValue({
    base: 2,
    md: 3,
    lg: 4,
  });

  const [mainTabIndex, setMainTabIndex] = useState(0);
  const [contractsTabIndex, setContractsTabIndex] = useState(0);
  const [utilsTabIndex, setUtilsTabIndex] = useState(0);

  const handleMainTabChange = (index: number) => {
    setMainTabIndex(index);
  };

  const handleContractsTabChange = (index: number) => {
    setContractsTabIndex(index);
  };

  const handleUtilsTabChange = (index: number) => {
    setUtilsTabIndex(index);
  };

  if (showVerticalTabs) {
    return (
      <>
        <ResponsiveHeader showMenuButton={false} onMenuToggle={() => {}} />
        <Tabs colorScheme="blue" variant="enclosed" index={mainTabIndex} onChange={handleMainTabChange}>
          <TabList>
            <Tab>{LL.admin.tabs.contracts()}</Tab>
            <Tab>{LL.admin.tabs.utils()}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <Tabs
                orientation="vertical"
                variant="line"
                colorScheme="gray"
                index={contractsTabIndex}
                onChange={handleContractsTabChange}>
                <TabList minW={sidebarWidth} mr={sidebarMargin}>
                  <Tab justifyContent="flex-start">{LL.admin.contracts.vevote()}</Tab>
                  <Tab justifyContent="flex-start">{LL.admin.contracts.node_management()}</Tab>
                  <Tab justifyContent="flex-start">{LL.admin.contracts.stargate_nodes()}</Tab>
                </TabList>

                <TabPanels flex="1">
                  {contractsContent.map((content, index) => (
                    <TabPanel key={contractKeys[index]}>{content}</TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </TabPanel>

            <TabPanel px={0}>
              <Tabs
                orientation="vertical"
                variant="line"
                colorScheme="gray"
                index={utilsTabIndex}
                onChange={handleUtilsTabChange}>
                <TabList minW={sidebarWidth} mr={sidebarMargin}>
                  <Tab justifyContent="flex-start">{LL.admin.tabs.users()}</Tab>
                  <Tab justifyContent="flex-start">{LL.admin.tabs.governance_settings()}</Tab>
                </TabList>

                <TabPanels flex="1">
                  {utilsContent.map((content, index) => (
                    <TabPanel key={utilsKeys[index]}>{content}</TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  }

  if (showHorizontalTabs) {
    return (
      <>
        <ResponsiveHeader showMenuButton={false} onMenuToggle={() => {}} />
        <Tabs colorScheme="blue" variant="enclosed" index={mainTabIndex} onChange={handleMainTabChange}>
          <TabList>
            <Tab>{LL.admin.tabs.contracts()}</Tab>
            <Tab>{LL.admin.tabs.utils()}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <Tabs variant="line" colorScheme="gray" index={contractsTabIndex} onChange={handleContractsTabChange}>
                <TabList flexWrap="wrap" mb={4}>
                  <Tab>{LL.admin.contracts.vevote()}</Tab>
                  <Tab>{LL.admin.contracts.node_management()}</Tab>
                  <Tab>{LL.admin.contracts.stargate_nodes()}</Tab>
                </TabList>

                <TabPanels>
                  {contractsContent.map((content, index) => (
                    <TabPanel key={contractKeys[index]} px={0}>
                      {content}
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </TabPanel>

            <TabPanel px={0}>
              <Tabs variant="line" colorScheme="gray" index={utilsTabIndex} onChange={handleUtilsTabChange}>
                <TabList flexWrap="wrap" mb={4}>
                  <Tab>{LL.admin.tabs.users()}</Tab>
                  <Tab>{LL.admin.tabs.governance_settings()}</Tab>
                </TabList>

                <TabPanels>
                  {utilsContent.map((content, index) => (
                    <TabPanel key={utilsKeys[index]} px={0}>
                      {content}
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  }

  if (showMobileDrawer) {
    const currentContent = mainTabIndex === 0 ? contractsContent[contractsTabIndex] : utilsContent[utilsTabIndex];

    return (
      <>
        <ResponsiveHeader showMenuButton={true} onMenuToggle={drawerState.onToggle} />

        <MobileNavDrawer
          isOpen={drawerState.isOpen}
          onClose={drawerState.onClose}
          activeMainTab={mainTabIndex}
          activeSubTab={mainTabIndex === 0 ? contractsTabIndex : utilsTabIndex}
          onMainTabChange={handleMainTabChange}
          onSubTabChange={mainTabIndex === 0 ? handleContractsTabChange : handleUtilsTabChange}
        />

        <Box>{currentContent}</Box>
      </>
    );
  }

  return (
    <>
      <ResponsiveHeader showMenuButton={false} onMenuToggle={() => {}} />
      <Tabs colorScheme="blue" variant="enclosed" index={mainTabIndex} onChange={handleMainTabChange}>
        <TabList>
          <Tab>{LL.admin.tabs.contracts()}</Tab>
          <Tab>{LL.admin.tabs.utils()}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Tabs
              orientation="vertical"
              variant="line"
              colorScheme="gray"
              index={contractsTabIndex}
              onChange={handleContractsTabChange}>
              <TabList minW="200px" mr={4}>
                <Tab justifyContent="flex-start">{LL.admin.contracts.vevote()}</Tab>
                <Tab justifyContent="flex-start">{LL.admin.contracts.node_management()}</Tab>
                <Tab justifyContent="flex-start">{LL.admin.contracts.stargate_nodes()}</Tab>
              </TabList>

              <TabPanels flex="1">
                {contractsContent.map((content, index) => (
                  <TabPanel key={contractKeys[index]}>{content}</TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </TabPanel>

          <TabPanel px={0}>
            <Tabs
              orientation="vertical"
              variant="line"
              colorScheme="gray"
              index={utilsTabIndex}
              onChange={handleUtilsTabChange}>
              <TabList minW="200px" mr={4}>
                <Tab justifyContent="flex-start">{LL.admin.tabs.users()}</Tab>
                <Tab justifyContent="flex-start">{LL.admin.tabs.governance_settings()}</Tab>
              </TabList>

              <TabPanels flex="1">
                {utilsContent.map((content, index) => (
                  <TabPanel key={utilsKeys[index]}>{content}</TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
