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
    <StyledButton bg={"white"} color={"gray.600"} _hover={{ bg: "gray.200" }} onClick={openAccountModal}>
      {formatAddress(account?.address || "")}
    </StyledButton>
  );
};

const StyledButton = (props: ButtonProps) => {
  return <Button flexShrink={0} leftIcon={<Icon as={WalletIcon} />} size={"md"} bg={"primary.700"} {...props} />;
};
