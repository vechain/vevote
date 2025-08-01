import { VotingPowerModal } from "@/components/proposal/VotingPowerModal";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { VoteLogo } from "@/components/ui/VoteLogo";
import { useUser } from "@/contexts/UserProvider";
import { Box, Container, defineStyle, Flex } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProposal } from "@/components/proposal/ProposalProvider";
import { DeleteEditProposal } from "./components/DeleteEditProposal";
import { CancelProposal } from "./components/CancelProposal";
import { ExecuteModal } from "./components/ExecuteModal";

export const bgHeaderStyle = defineStyle({
  bgImage: { base: "/images/banner-bg-mobile.webp", md: "/images/banner-bg.webp" },
  bgSize: "cover",
  bgPosition: "top",
  bgRepeat: "no-repeat",
  bgAttachment: "fixed",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
});

export const Navbar = () => {
  const { connection } = useWallet();
  return (
    <Box {...bgHeaderStyle} position="fixed" top="0" width="100%" zIndex={1000}>
      <Container maxWidth={"1440px"} marginX={"auto"}>
        <Flex justifyContent={"space-between"} alignItems={"center"} gap={6} paddingY={4} paddingX={{ base: 4, md: 4 }}>
          <Link to="/">
            <VoteLogo width={{ base: 16, md: 20 }} />
          </Link>

          <Flex alignItems={"center"} gap={{ base: 3, md: 6 }}>
            {connection.isConnected && !connection.isLoading && <ProposalNavbarActions />}
            {connection.isConnected && !connection.isLoading && <VotingPowerModal />}
            <ConnectButton />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

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

  if (!proposal || proposal.id === "default") return null;

  return (
    <Flex alignItems={"center"} gap={2} marginLeft={"auto"}>
      {canEditDraft && <DeleteEditProposal />}
      {canCancel && <CancelProposal proposalId={proposal?.id} />}
      {isExecutor && proposal?.status === "approved" && <ExecuteModal proposalId={proposal?.id} />}
    </Flex>
  );
};
