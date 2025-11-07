import { MobileNavDrawer } from "../MobileNavDrawer";
import { ResponsiveHeader } from "../ResponsiveHeader";
import { MobileContent } from "../NavigationComponents";

interface MobileLayoutProps {
  mainTabIndex: number;
  contractsTabIndex: number;
  utilsTabIndex: number;
  onMainTabChange: (index: number) => void;
  onContractsTabChange: (index: number) => void;
  onUtilsTabChange: (index: number) => void;
  contractsContent: React.ReactNode[];
  utilsContent: React.ReactNode[];
  drawerState: {
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
  };
}

export function MobileLayout({
  mainTabIndex,
  contractsTabIndex,
  utilsTabIndex,
  onMainTabChange,
  onContractsTabChange,
  onUtilsTabChange,
  contractsContent,
  utilsContent,
  drawerState,
}: MobileLayoutProps) {
  return (
    <>
      <ResponsiveHeader showMenuButton={true} onMenuToggle={drawerState.onToggle} />

      <MobileNavDrawer
        isOpen={drawerState.isOpen}
        onClose={drawerState.onClose}
        activeMainTab={mainTabIndex}
        activeSubTab={mainTabIndex === 0 ? contractsTabIndex : utilsTabIndex}
        onMainTabChange={onMainTabChange}
        onSubTabChange={mainTabIndex === 0 ? onContractsTabChange : onUtilsTabChange}
      />

      <MobileContent
        mainTabIndex={mainTabIndex}
        contractsTabIndex={contractsTabIndex}
        utilsTabIndex={utilsTabIndex}
        contractsContent={contractsContent}
        utilsContent={utilsContent}
      />
    </>
  );
}
