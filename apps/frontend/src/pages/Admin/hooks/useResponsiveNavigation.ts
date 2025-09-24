import { useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import { useMemo } from "react";

export function useResponsiveNavigation() {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  const layout = useBreakpointValue(
    {
      base: "sm",
      md: "md",
      lg: "lg",
    },
    {
      fallback: "sm",
    },
  );

  const resultLayout = useMemo(() => {
    const showVerticalTabs = layout === "lg";
    const showHorizontalTabs = layout === "md";
    const showMobileDrawer = layout === "sm";
    return {
      layout,
      showVerticalTabs,
      showHorizontalTabs,
      showMobileDrawer,
    };
  }, [layout]);

  return {
    ...resultLayout,
    drawerState: {
      isOpen,
      onOpen,
      onClose,
      onToggle,
    },
  };
}
