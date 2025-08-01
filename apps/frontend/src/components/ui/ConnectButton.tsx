import { useI18nContext } from "@/i18n/i18n-react";
import { WalletIcon } from "@/icons";
import { Avatar, Button, ButtonProps, Flex, Icon, Text } from "@chakra-ui/react";
import { useAccountModal, useConnectModal, useWallet } from "@vechain/vechain-kit";

export const ConnectButton = ({ text, ...props }: ButtonProps & { text?: string }) => {
  const { connection, account } = useWallet();

  const { LL } = useI18nContext();
  const { open: openConnectModal } = useConnectModal();
  const { open: openAccountModal } = useAccountModal();

  if (connection.isLoading) return <Flex height={12} />;
  if (!connection.isConnected)
    return (
      <StyledButton leftIcon={<Icon as={WalletIcon} />} onClick={openConnectModal} {...props}>
        <Text display={{ base: "none", md: "block" }}>{text || LL.connect_wallet()}</Text>
      </StyledButton>
    );
  return (
    <Avatar
      size="sm"
      src={account?.image}
      bg="gray.200"
      borderRadius="full"
      onClick={openAccountModal}
      cursor="pointer"
    />
  );
};

const StyledButton = (props: ButtonProps) => {
  return <Button flexShrink={0} size={{ base: "md", md: "lg" }} {...props} />;
};
