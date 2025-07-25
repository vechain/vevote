import { useI18nContext } from "@/i18n/i18n-react";
import { WalletIcon } from "@/icons";
import { formatAddress } from "@/utils/address";
import { Button, ButtonProps, Icon, Text } from "@chakra-ui/react";
import { useAccountModal, useConnectModal, useWallet } from "@vechain/vechain-kit";

export const ConnectButton = ({ text, ...props }: ButtonProps & { text?: string }) => {
  const { connection, account } = useWallet();

  const { LL } = useI18nContext();
  const { open: openConnectModal } = useConnectModal();
  const { open: openAccountModal } = useAccountModal();

  if (!connection.isConnected)
    return (
      <StyledButton leftIcon={<Icon as={WalletIcon} />} onClick={openConnectModal} {...props}>
        <Text display={{ base: "none", md: "block" }}>{text || LL.connect_wallet()}</Text>
      </StyledButton>
    );
  return (
    <StyledButton
      {...props}
      bg={"white"}
      color={"gray.600"}
      _hover={{ bg: "gray.200" }}
      onClick={openAccountModal}
      leftIcon={<Icon as={WalletIcon} />}>
      <Text display={{ base: "none", md: "block" }}>{formatAddress(account?.address || "")}</Text>
    </StyledButton>
  );
};

const StyledButton = (props: ButtonProps) => {
  return <Button flexShrink={0} size={{ base: "md", md: "lg" }} {...props} />;
};
