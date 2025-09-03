import {
  Box,
  Heading,
  HStack,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { MenuIcon } from "@/icons";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { useI18nContext } from "@/i18n/i18n-react";

interface ResponsiveHeaderProps {
  showMenuButton: boolean;
  onMenuToggle: () => void;
}

export function ResponsiveHeader({ showMenuButton, onMenuToggle }: ResponsiveHeaderProps) {
  const { LL } = useI18nContext();
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      borderBottomWidth={showMenuButton ? "1px" : "0"}
      borderColor={borderColor}
      pb={showMenuButton ? 4 : 0}
      mb={showMenuButton ? 4 : 8}
    >
      <HStack w="full" alignItems="center">
        {showMenuButton && (
          <IconButton
            aria-label="Open navigation menu"
            icon={<MenuIcon />}
            variant="ghost"
            size="md"
            onClick={onMenuToggle}
          />
        )}
        <Heading size="lg">{LL.admin.title()}</Heading>
        <Box ml="auto">
          <ConnectButton />
        </Box>
      </HStack>
    </Box>
  );
}