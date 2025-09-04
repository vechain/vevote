import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  VStack,
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@/icons";
import { useI18nContext } from "@/i18n/i18n-react";

interface MobileNavDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly activeMainTab: number;
  readonly activeSubTab: number;
  readonly onMainTabChange: (index: number) => void;
  readonly onSubTabChange: (index: number) => void;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  activeMainTab,
  activeSubTab,
  onMainTabChange,
  onSubTabChange,
}: MobileNavDrawerProps) {
  const { LL } = useI18nContext();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const contractsSubTabs = [
    { label: LL.admin.contracts.vevote(), index: 0, id: "vevote" },
    { label: LL.admin.contracts.node_management(), index: 1, id: "node-management" },
    { label: LL.admin.contracts.stargate_nodes(), index: 2, id: "stargate-nodes" },
  ];

  const utilsSubTabs = [
    { label: LL.admin.tabs.users(), index: 0, id: "users" },
    { label: LL.admin.tabs.governance_settings(), index: 1, id: "governance-settings" },
  ];

  const handleNavigation = (mainTabIndex: number, subTabIndex: number) => {
    onMainTabChange(mainTabIndex);
    onSubTabChange(subTabIndex);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          {LL.admin.title()}
        </DrawerHeader>

        <DrawerBody p={0}>
          <Accordion allowToggle index={activeMainTab} onChange={onMainTabChange}>
            {/* Contracts Section */}
            <AccordionItem border="none">
              <AccordionButton py={4} px={6} _expanded={{ bg: "gray.50" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="medium">{LL.admin.tabs.contracts()}</Text>
                </Box>
                <ChevronDownIcon />
              </AccordionButton>
              <AccordionPanel p={0}>
                <VStack spacing={0} align="stretch">
                  {contractsSubTabs.map(tab => (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      justifyContent="flex-start"
                      py={3}
                      px={8}
                      borderRadius="none"
                      fontWeight="normal"
                      bg={activeMainTab === 0 && activeSubTab === tab.index ? "blue.50" : "transparent"}
                      color={activeMainTab === 0 && activeSubTab === tab.index ? "blue.600" : "inherit"}
                      onClick={() => handleNavigation(0, tab.index)}>
                      {tab.label}
                    </Button>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Utils Section */}
            <AccordionItem border="none">
              <AccordionButton py={4} px={6} _expanded={{ bg: "gray.50" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="medium">{LL.admin.tabs.utils()}</Text>
                </Box>
                <ChevronDownIcon />
              </AccordionButton>
              <AccordionPanel p={0}>
                <VStack spacing={0} align="stretch">
                  {utilsSubTabs.map(tab => (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      justifyContent="flex-start"
                      py={3}
                      px={8}
                      borderRadius="none"
                      fontWeight="normal"
                      bg={activeMainTab === 1 && activeSubTab === tab.index ? "blue.50" : "transparent"}
                      color={activeMainTab === 1 && activeSubTab === tab.index ? "blue.600" : "inherit"}
                      onClick={() => handleNavigation(1, tab.index)}>
                      {tab.label}
                    </Button>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
