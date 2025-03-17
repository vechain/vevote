import { HStack, Heading, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";

export const Navbar = () => {
  return (
    <HStack justify={"space-between"} p={2} borderBottom={"1px solid #EEEEEE"}>
      <Heading>VeVote</Heading>
      <DAppKitWalletButton
        mobile={useBreakpointValue({
          base: true,
          md: false,
        })}
      />
    </HStack>
  );
};
