import { MobileNavDrawer } from "../MobileNavDrawer";
import { ResponsiveHeader } from "../ResponsiveHeader";
import { MobileContent } from "../NavigationComponents";

interface MobileLayoutProps {
  readonly mainTabIndex: number;
  readonly contractsTabIndex: number;
  readonly utilsTabIndex: number;
  readonly onMainTabChange: (index: number) => void;
  readonly onContractsTabChange: (index: number) => void;
  readonly onUtilsTabChange: (index: number) => void;
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
  readonly drawerState: {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onToggle: () => void;
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