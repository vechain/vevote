import { HStack, Heading, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";
import { Status } from "../Status";
import { useI18nContext } from "@/i18n/i18n-react";

export const Navbar = () => {
  const { LL } = useI18nContext();
  return (
    <HStack justify={"space-between"} p={2} borderBottom={"1px solid #EEEEEE"}>
      <Heading>Proposal</Heading>
      <Status text={LL.statuses.voted()} />
      <DAppKitWalletButton
        mobile={useBreakpointValue({
          base: true,
          md: false,
        })}
      />
    </HStack>
  );
};
