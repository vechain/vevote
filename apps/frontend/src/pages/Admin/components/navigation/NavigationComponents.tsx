import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useMemo } from "react";
import { TranslationFunctions } from "@/i18n/i18n-types";

const contractKeys = ["vevote-contract", "node-management", "stargate-nodes"];
const utilsKeys = ["user-management", "governance-settings"];

interface MainTabsProps {
  readonly mainTabIndex: number;
  readonly onMainTabChange: (index: number) => void;
  readonly children: React.ReactNode;
}

const getTabLabels = (type: "contracts" | "utils", LL: TranslationFunctions) =>
  type === "contracts"
    ? [LL.admin.contracts.vevote(), LL.admin.contracts.node_management(), LL.admin.contracts.stargate_nodes()]
    : [LL.admin.tabs.users(), LL.admin.tabs.governance_settings()];

export function MainTabs({ mainTabIndex, onMainTabChange, children }: MainTabsProps) {
  const { LL } = useI18nContext();

  return (
    <Tabs variant="enclosed" index={mainTabIndex} onChange={onMainTabChange}>
      <TabList>
        <Tab>{LL.admin.tabs.contracts()}</Tab>
        <Tab>{LL.admin.tabs.utils()}</Tab>
      </TabList>
      <TabPanels>{children}</TabPanels>
    </Tabs>
  );
}

interface VerticalTabsProps {
  readonly tabIndex: number;
  readonly onTabChange: (index: number) => void;
  readonly content: readonly React.ReactNode[];
  readonly type: "contracts" | "utils";
  readonly sidebarWidth?: string;
  readonly sidebarMargin?: number;
}

export function VerticalTabs({
  tabIndex,
  onTabChange,
  content,
  type,
  sidebarWidth = "200px",
  sidebarMargin = 4,
}: VerticalTabsProps) {
  const { LL } = useI18nContext();
  const keys = type === "contracts" ? contractKeys : utilsKeys;

  const tabLabels = useMemo(() => getTabLabels(type, LL), [LL, type]);

  return (
    <Tabs orientation="vertical" variant="line" index={tabIndex} onChange={onTabChange}>
      <TabList minW={sidebarWidth} mr={sidebarMargin}>
        {tabLabels.map(label => (
          <Tab key={label} justifyContent="flex-start">
            {label}
          </Tab>
        ))}
      </TabList>

      <TabPanels flex="1">
        {content.map((item, index) => (
          <TabPanel key={keys[index]}>{item}</TabPanel>
        ))}
      </TabPanels>
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
  const keys = type === "contracts" ? contractKeys : utilsKeys;

  const tabLabels = useMemo(() => getTabLabels(type, LL), [LL, type]);

  return (
    <Tabs variant="line" index={tabIndex} onChange={onTabChange}>
      <TabList flexWrap="wrap" mb={4}>
        {tabLabels.map(label => (
          <Tab key={label}>{label}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {content.map((item, index) => (
          <TabPanel key={keys[index]} px={0}>
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
