import { useI18nContext } from "@/i18n/i18n-react";
import { WalletIcon } from "@/icons";
import { formatAddress } from "@/utils/address";
import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import { useAccountModal, useConnectModal, useWallet } from "@vechain/vechain-kit";

export const ConnectButton = ({ text, ...props }: ButtonProps & { text?: string }) => {
  const { connection, account } = useWallet();

  const { LL } = useI18nContext();
  const { open: openConnectModal } = useConnectModal();
  const { open: openAccountModal } = useAccountModal();

  if (!connection.isConnected)
    return (
      <StyledButton leftIcon={<Icon as={WalletIcon} />} onClick={openConnectModal} {...props}>
        {text || LL.connect_wallet()}
      </StyledButton>
    );
  return (
    <>
      <StyledButton
        {...props}
        bg={"white"}
        color={"gray.600"}
        _hover={{ bg: "gray.200" }}
        onClick={openAccountModal}
        display={{ base: "none", md: "flex" }}
        leftIcon={<Icon as={WalletIcon} />}>
        {formatAddress(account?.address || "")}
      </StyledButton>
      <StyledButton
        {...props}
        bg={"white"}
        color={"gray.600"}
        _hover={{ bg: "gray.200" }}
        onClick={openAccountModal}
        display={{ base: "flex", md: "none" }}
        size={"md"}
        minWidth={"40px"}
        w={"40px"}
        leftIcon={<Icon as={WalletIcon} boxSize={5} />}
      />
    </>
  );
};

const StyledButton = (props: ButtonProps) => {
  return <Button flexShrink={0} size={{ base: "md", md: "lg" }} {...props} />;
};
