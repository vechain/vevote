import { useI18nContext } from "@/i18n/i18n-react";
import { WalletIcon } from "@/icons";
import { formatAddress } from "@/utils/address";
import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import { useAccountModal, useConnectModal, useWallet } from "@vechain/vechain-kit";

export const ConnectButton = () => {
  const { connection, account } = useWallet();

  const { LL } = useI18nContext();
  const { open: openConnectModal } = useConnectModal();
  const { open: openAccountModal } = useAccountModal();

  if (!connection.isConnected) return <StyledButton onClick={openConnectModal}>{LL.connect_wallet()}</StyledButton>;
  return (
    <>
      <StyledButton
        bg={"white"}
        color={"gray.600"}
        _hover={{ bg: "gray.200" }}
        onClick={openAccountModal}
        display={{ base: "none", md: "flex" }}
        leftIcon={<Icon as={WalletIcon} />}>
        {formatAddress(account?.address || "")}
      </StyledButton>
      <StyledButton
        bg={"white"}
        color={"gray.600"}
        _hover={{ bg: "gray.200" }}
        onClick={openAccountModal}
        display={{ base: "flex", md: "none" }}
        size={"md"}
        minWidth={"40px"}
        w={"40px"}
        leftIcon={<Icon as={WalletIcon} w={5} h={5} />}
      />
    </>
  );
};

const StyledButton = (props: ButtonProps) => {
  return <Button flexShrink={0} size={"md"} bg={"primary.700"} {...props} />;
};
