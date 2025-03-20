import { HStack, Heading, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";
import { IconBadge } from "../IconBadge";

export const Navbar = () => {
  return (
    <HStack justify={"space-between"} p={2} borderBottom={"1px solid #EEEEEE"}>
      <Heading>Proposal</Heading>
      <IconBadge variant={"draft"} />
      <DAppKitWalletButton
        mobile={useBreakpointValue({
          base: true,
          md: false,
        })}
      />
    </HStack>
  );
};
