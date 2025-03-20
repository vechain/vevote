import { HStack, Heading, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";
import { SearchInput } from "../SearchInput";
import { useState } from "react";

export const Navbar = () => {
  const [search, setSearch] = useState("");
  return (
    <HStack justify={"space-between"} p={2} borderBottom={"1px solid #EEEEEE"}>
      <Heading>Proposal</Heading>
      <SearchInput onChange={e => setSearch(e.currentTarget?.value)} value={search} onClear={() => setSearch("")} />
      <DAppKitWalletButton
        mobile={useBreakpointValue({
          base: true,
          md: false,
        })}
      />
    </HStack>
  );
};
