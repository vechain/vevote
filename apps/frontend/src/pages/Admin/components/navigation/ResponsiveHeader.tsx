import { Box, Heading, HStack, IconButton } from "@chakra-ui/react";
import { MenuIcon } from "@/icons";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { useI18nContext } from "@/i18n/i18n-react";

interface ResponsiveHeaderProps {
  readonly showMenuButton: boolean;
  readonly onMenuToggle: () => void;
}

export function ResponsiveHeader({ showMenuButton, onMenuToggle }: ResponsiveHeaderProps) {
  const { LL } = useI18nContext();

  return (
    <Box borderBottomWidth={showMenuButton ? "1px" : "0"} borderColor={"gray.400"} pb={{ base: 4, md: 0 }}>
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
        <Heading size="lg" color={"primary.900"}>
          {LL.admin.title()}
        </Heading>
        <Box ml="auto">
          <ConnectButton />
        </Box>
      </HStack>
    </Box>
  );
}
