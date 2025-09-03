import { TabPanel } from "@chakra-ui/react";
import { MainTabs, HorizontalTabs } from "../NavigationComponents";
import { ResponsiveHeader } from "../ResponsiveHeader";

interface HorizontalLayoutProps {
  readonly mainTabIndex: number;
  readonly contractsTabIndex: number;
  readonly utilsTabIndex: number;
  readonly onMainTabChange: (index: number) => void;
  readonly onContractsTabChange: (index: number) => void;
  readonly onUtilsTabChange: (index: number) => void;
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
}

export function HorizontalLayout({
  mainTabIndex,
  contractsTabIndex,
  utilsTabIndex,
  onMainTabChange,
  onContractsTabChange,
  onUtilsTabChange,
  contractsContent,
  utilsContent,
}: HorizontalLayoutProps) {
  return (
    <>
      <ResponsiveHeader showMenuButton={false} onMenuToggle={() => {}} />
      <MainTabs mainTabIndex={mainTabIndex} onMainTabChange={onMainTabChange}>
        <TabPanel px={0} pt={{ base: 3, md: 4 }}>
          <HorizontalTabs
            tabIndex={contractsTabIndex}
            onTabChange={onContractsTabChange}
            content={contractsContent}
            type="contracts"
          />
        </TabPanel>

        <TabPanel px={0} pt={{ base: 3, md: 4 }}>
          <HorizontalTabs tabIndex={utilsTabIndex} onTabChange={onUtilsTabChange} content={utilsContent} type="utils" />
        </TabPanel>
      </MainTabs>
    </>
  );
}
