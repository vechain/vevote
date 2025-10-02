import { TabPanel } from "@chakra-ui/react";
import { MainTabs, HorizontalTabs } from "../NavigationComponents";
import { ResponsiveHeader } from "../ResponsiveHeader";

interface HorizontalLayoutProps {
  mainTabIndex: number;
  contractsTabIndex: number;
  utilsTabIndex: number;
  onMainTabChange: (index: number) => void;
  onContractsTabChange: (index: number) => void;
  onUtilsTabChange: (index: number) => void;
  contractsContent: React.ReactNode[];
  utilsContent: React.ReactNode[];
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
