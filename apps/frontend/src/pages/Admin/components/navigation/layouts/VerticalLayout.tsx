import { TabPanel } from "@chakra-ui/react";
import { MainTabs, VerticalTabs } from "../NavigationComponents";
import { ResponsiveHeader } from "../ResponsiveHeader";

interface VerticalLayoutProps {
  readonly mainTabIndex: number;
  readonly contractsTabIndex: number;
  readonly utilsTabIndex: number;
  readonly onMainTabChange: (index: number) => void;
  readonly onContractsTabChange: (index: number) => void;
  readonly onUtilsTabChange: (index: number) => void;
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
  readonly sidebarWidth?: string;
  readonly sidebarMargin?: number;
}

export function VerticalLayout({
  mainTabIndex,
  contractsTabIndex,
  utilsTabIndex,
  onMainTabChange,
  onContractsTabChange,
  onUtilsTabChange,
  contractsContent,
  utilsContent,
  sidebarWidth,
  sidebarMargin,
}: VerticalLayoutProps) {
  return (
    <>
      <ResponsiveHeader showMenuButton={false} onMenuToggle={() => {}} />
      <MainTabs mainTabIndex={mainTabIndex} onMainTabChange={onMainTabChange}>
        <TabPanel px={0}>
          <VerticalTabs
            tabIndex={contractsTabIndex}
            onTabChange={onContractsTabChange}
            content={contractsContent}
            type="contracts"
            sidebarWidth={sidebarWidth}
            sidebarMargin={sidebarMargin}
          />
        </TabPanel>

        <TabPanel px={0}>
          <VerticalTabs
            tabIndex={utilsTabIndex}
            onTabChange={onUtilsTabChange}
            content={utilsContent}
            type="utils"
            sidebarWidth={sidebarWidth}
            sidebarMargin={sidebarMargin}
          />
        </TabPanel>
      </MainTabs>
    </>
  );
}