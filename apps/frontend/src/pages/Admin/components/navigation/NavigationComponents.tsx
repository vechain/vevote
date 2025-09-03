import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useMemo } from "react";

const contractKeys = ["vevote-contract", "node-management", "stargate-nodes"];
const utilsKeys = ["user-management", "governance-settings", "voting-power-timepoint"];

interface MainTabsProps {
  readonly mainTabIndex: number;
  readonly onMainTabChange: (index: number) => void;
  readonly children: React.ReactNode;
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
  readonly tabIndex: number;
  readonly onTabChange: (index: number) => void;
  readonly content: readonly React.ReactNode[];
  readonly type: "contracts" | "utils";
}

export function HorizontalTabs({ tabIndex, onTabChange, content, type }: HorizontalTabsProps) {
  const { LL } = useI18nContext();
  const keys = useMemo(() => (type === "contracts" ? contractKeys : utilsKeys), [type]);
  const tabLabels = useMemo(
    () =>
      type === "contracts"
        ? [LL.admin.contracts.vevote(), LL.admin.contracts.node_management(), LL.admin.contracts.stargate_nodes()]
        : [LL.admin.tabs.users(), LL.admin.tabs.governance_settings(), LL.admin.tabs.voting_power_timepoint()],
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
          <TabPanel key={keys[index]} pt={{ base: 3, md: 6 }} px={4}>
            {item}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

interface MobileContentProps {
  readonly mainTabIndex: number;
  readonly contractsTabIndex: number;
  readonly utilsTabIndex: number;
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
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
