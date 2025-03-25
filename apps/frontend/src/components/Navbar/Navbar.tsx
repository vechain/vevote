import { HStack, Heading, Link, useBreakpointValue } from "@chakra-ui/react";
import { DAppKitWalletButton } from "@vechain/vechain-kit";
import { Sort, SortDropdown } from "../ui/SortDropdown";
import { useState } from "react";

export const Navbar = () => {
  const [sort, setSort] = useState<Sort>(Sort.Newest);
  return (
    <HStack justify={"space-between"} p={2} borderBottom={"1px solid #EEEEEE"}>
      <Heading>Proposal</Heading>
      <Link>{"Link"}</Link>
      <SortDropdown setSort={setSort} sort={sort} />
      <DAppKitWalletButton
        mobile={useBreakpointValue({
          base: true,
          md: false,
        })}
      />
    </HStack>
  );
};
