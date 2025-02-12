import { Box, Container, VStack } from "@chakra-ui/react";
import { Home } from "./pages/Home";
import { useWallet } from "@vechain/dapp-kit-react";
import { NotConnected } from "./pages/NotConnected";
import { Navbar } from "./components/Navbar";

function App() {
  const { account } = useWallet();
  return (
    <Box h="full" bgColor="#f7f7f7">
      <VStack h="100vh" align="stretch" gap="0">
        <Navbar />
        <VStack align="stretch" flex="1" overflowY={"auto"} py={4}>
          <Container maxW="container.lg" h="full">
            <VStack align="stretch">
              {account ? <Home /> : <NotConnected />}
            </VStack>
          </Container>
        </VStack>
      </VStack>
    </Box>
  );
}

export default App;
