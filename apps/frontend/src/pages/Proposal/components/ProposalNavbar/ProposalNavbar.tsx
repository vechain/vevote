import { VotingPowerModal } from "@/components/proposal/VotingPowerModal";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { VoteLogo } from "@/components/ui/VoteLogo";
import { useUser } from "@/contexts/UserProvider";
import { Box, Flex } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { DeleteEditProposal } from "./components/DeleteEditProposal";
import { CancelProposal } from "./components/CancelProposal";
import { ExecuteModal } from "./components/ExecuteModal";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { bgHeaderStyle } from "@/components/navbar/Navbar";

const ProposalNavbarActions = () => {
  const { proposal } = useProposal();
  const { isExecutor, isWhitelisted } = useUser();

  const canCancel = useMemo(
    () => isWhitelisted && ["upcoming"].includes(proposal?.status || ""),
    [isWhitelisted, proposal?.status],
  );

  const canEditDraft = useMemo(
    () => isWhitelisted && ["draft"].includes(proposal?.status || ""),
    [isWhitelisted, proposal?.status],
  );

  return (
    <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
      {canEditDraft && <DeleteEditProposal />}
      {canCancel && <CancelProposal proposalId={proposal?.id} />}
      {isExecutor && proposal?.status === "approved" && <ExecuteModal proposalId={proposal?.id} />}
    </Flex>
  );
};

export const ProposalNavbar = () => {
  const { connection } = useWallet();
  return (
    <Box {...bgHeaderStyle} position="fixed" top="0" width="100%" zIndex={1000}>
      <Flex justifyContent={"space-between"} alignItems={"center"} gap={6} paddingY={4} paddingX={{ base: 4, md: 20 }}>
        <Link to="/">
          <VoteLogo width={{ base: 16, md: 20 }} />
        </Link>

        <Flex alignItems={"center"} gap={{ base: 3, md: 6 }}>
          <ProposalNavbarActions />
          {connection.isConnected && <VotingPowerModal />}
          <ConnectButton />
        </Flex>
      </Flex>
    </Box>
  );
};
