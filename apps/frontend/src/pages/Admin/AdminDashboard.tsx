import { Container, useBreakpointValue } from "@chakra-ui/react";
import { VeVoteContract } from "./components/Contracts/VeVoteContract";
import { NodeManagement } from "./components/Contracts/NodeManagement";
import { StargateNodes } from "./components/Contracts/StargateNodes";
import { UserManagement } from "./components/Utils/UserManagement";
import { GovernanceSettings } from "./components/Utils/GovernanceSettings";
import { ResponsiveNavigation } from "./components/navigation/ResponsiveNavigation";

export function AdminDashboard() {
  const containerPadding = useBreakpointValue({
    base: 4,
    md: 8,
  });

  const contractsContent = [
    <VeVoteContract />,
    <NodeManagement />,
    <StargateNodes />,
  ];

  const utilsContent = [
    <UserManagement />,
    <GovernanceSettings />,
  ];

  return (
    <Container maxW="container.xl" py={containerPadding} px={containerPadding}>
      <ResponsiveNavigation 
        contractsContent={contractsContent}
        utilsContent={utilsContent}
      />
    </Container>
  );
}
