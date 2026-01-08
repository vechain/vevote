import { useI18nContext } from "@/i18n/i18n-react";
import { WalletIcon } from "@/icons";
import { Avatar, Button, ButtonProps, Flex, Icon, Text } from "@chakra-ui/react";
import { useConnectModal, useProfileModal, useWallet } from "@vechain/vechain-kit";
import { useEffect, useState } from "react";

export const ConnectButton = ({ text, ...props }: ButtonProps & { text?: string }) => {
  const { connection, account } = useWallet();
  const [canRender, setCanRender] = useState(false);

  const { LL } = useI18nContext();
  const { open: openConnectModal } = useConnectModal();
  const { open: openProfileModal } = useProfileModal();

  // add a rendering debouncer to avoid flickering
  useEffect(() => {
    if (!connection.isLoading) {
      setTimeout(() => {
        setCanRender(true);
      }, 100);
    }
  }, [connection.isLoading]);

  if (connection.isLoading || !canRender) return <Flex height={12} width={8} />;
  if (!connection.isConnected)
    return (
      <StyledButton leftIcon={<Icon as={WalletIcon} />} onClick={() => openConnectModal()} {...props}>
        <Text display={{ base: "none", md: "block" }}>{text || LL.connect_wallet()}</Text>
      </StyledButton>
    );
  return (
    <Avatar
      size="sm"
      src={account?.image}
      bg="gray.200"
      borderRadius="full"
      onClick={() => openProfileModal()}
      cursor="pointer"
    />
  );
};

const StyledButton = (props: ButtonProps) => {
  return <Button flexShrink={0} size={{ base: "md", md: "lg" }} {...props} />;
};
