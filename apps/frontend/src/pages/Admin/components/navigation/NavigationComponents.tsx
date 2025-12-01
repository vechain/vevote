import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useMemo } from "react";

const contractKeys = ["vevote-contract", "node-management", "stargate-nodes"];
const utilsKeys = ["user-management", "governance-settings"];

interface MainTabsProps {
  mainTabIndex: number;
  onMainTabChange: (index: number) => void;
  children: React.ReactNode;
}

export function MainTabs({ mainTabIndex, onMainTabChange, children }: MainTabsProps) {
  const { LL } = useI18nContext();

  return (
    <Tabs index={mainTabIndex} onChange={onMainTabChange}>
      <TabList>
        <Tab>{LL.admin.tabs.contracts()}</Tab>
        <Tab>{LL.admin.tabs.utils()}</Tab>
      </TabList>
      <TabPanels>{children}</TabPanels>
    </Tabs>
  );
}

interface HorizontalTabsProps {
  tabIndex: number;
  onTabChange: (index: number) => void;
  content: React.ReactNode[];
  type: "contracts" | "utils";
}

export function HorizontalTabs({ tabIndex, onTabChange, content, type }: HorizontalTabsProps) {
  const { LL } = useI18nContext();
  const keys = useMemo(() => (type === "contracts" ? contractKeys : utilsKeys), [type]);
  const tabLabels = useMemo(
    () =>
      type === "contracts"
        ? [LL.admin.contracts.vevote(), LL.admin.contracts.node_management(), LL.admin.contracts.stargate_nodes()]
        : [LL.admin.tabs.users(), LL.admin.tabs.governance_settings()],
    [LL, type],
  );

  return (
    <Tabs index={tabIndex} onChange={onTabChange}>
      <TabList flexWrap="wrap">
        {tabLabels.map(label => (
          <Tab key={label}>{label}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {content.map((item, index) => (
          <TabPanel key={keys[index]} pt={{ base: 3, md: 6 }} pb={4}>
            {item}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

interface MobileContentProps {
  mainTabIndex: number;
  contractsTabIndex: number;
  utilsTabIndex: number;
  contractsContent: React.ReactNode[];
  utilsContent: React.ReactNode[];
}

export function MobileContent({
  mainTabIndex,
  contractsTabIndex,
  utilsTabIndex,
  contractsContent,
  utilsContent,
}: MobileContentProps) {
  const currentContent = useMemo(
    () => (mainTabIndex === 0 ? contractsContent[contractsTabIndex] : utilsContent[utilsTabIndex]),
    [mainTabIndex, contractsTabIndex, utilsTabIndex, contractsContent, utilsContent],
  );

  return <Box>{currentContent}</Box>;
}
