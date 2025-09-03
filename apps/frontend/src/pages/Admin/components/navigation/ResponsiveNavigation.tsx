import { useMemo, useState } from "react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useResponsiveNavigation } from "../../hooks/useResponsiveNavigation";
import { VerticalLayout } from "./layouts/VerticalLayout";
import { HorizontalLayout } from "./layouts/HorizontalLayout";
import { MobileLayout } from "./layouts/MobileLayout";

interface ResponsiveNavigationProps {
  readonly contractsContent: readonly React.ReactNode[];
  readonly utilsContent: readonly React.ReactNode[];
}

export function ResponsiveNavigation({ contractsContent, utilsContent }: ResponsiveNavigationProps) {
  const { showHorizontalTabs, showMobileDrawer, drawerState } = useResponsiveNavigation();

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

  if (showHorizontalTabs) return <HorizontalLayout {...commonProps} />;

  return <VerticalLayout {...commonProps} sidebarWidth={sidebarWidth} sidebarMargin={sidebarMargin} />;
}
