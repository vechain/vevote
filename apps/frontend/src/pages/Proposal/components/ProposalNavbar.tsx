import { VotingPowerModal } from "@/components/proposal/VotingPowerModal";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { VoteLogo } from "@/components/ui/VoteLogo";
import { Box, Flex } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { Link } from "react-router-dom";

export const ProposalNavbar = () => {
  const { connection } = useWallet();
  return (
    <Box backgroundColor={"#1b1d1f"} position="fixed" top="0" width="100%" zIndex={1000}>
      <Flex justifyContent={"space-between"} alignItems={"center"} gap={6} paddingY={4} paddingX={{ base: 4, md: 20 }}>
        <Link to="/">
          <VoteLogo width={{ base: 16, md: 20 }} />
        </Link>
        <Flex alignItems={"center"} gap={{ base: 3, md: 6 }}>
          {connection.isConnected && <VotingPowerModal />}
          <ConnectButton />
        </Flex>
      </Flex>
    </Box>
  );
};
