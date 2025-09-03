import { useMemo, useState } from "react";
import { useResponsiveNavigation } from "../../hooks/useResponsiveNavigation";
import { HorizontalLayout } from "./layouts/HorizontalLayout";
import { MobileLayout } from "./layouts/MobileLayout";

interface ResponsiveNavigationProps {
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
}

export function ResponsiveNavigation({ contractsContent, utilsContent }: ResponsiveNavigationProps) {
  const { showMobileDrawer, drawerState } = useResponsiveNavigation();

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

  const commonProps = useMemo(
    () => ({
      mainTabIndex,
      contractsTabIndex,
      utilsTabIndex,
      onMainTabChange: handleMainTabChange,
      onContractsTabChange: handleContractsTabChange,
      onUtilsTabChange: handleUtilsTabChange,
      contractsContent,
      utilsContent,
    }),
    [mainTabIndex, contractsTabIndex, utilsTabIndex, contractsContent, utilsContent],
  );

  if (showMobileDrawer) return <MobileLayout {...commonProps} drawerState={drawerState} />;

  return <HorizontalLayout {...commonProps} />;
}
