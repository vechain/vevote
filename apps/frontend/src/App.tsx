import { Box, Container, VStack } from "@chakra-ui/react";
import { Home } from "./pages/Home";
import { NotConnected } from "./pages/NotConnected";
import { useWallet } from "@vechain/vechain-kit";
import { Footer } from "./components/footer/Footer";
import { Header } from "./components/navbar/Header";

function App() {
  const { account } = useWallet();

  return (
    <Box h="full" bgColor="#f7f7f7">
      <VStack minH="100vh" align="stretch">
        <Header />
        <VStack align="stretch" flex="1" overflowY={"auto"} py={4}>
          <Container maxW="container.lg" h="full">
            <VStack align="stretch">{account?.address ? <Home /> : <NotConnected />}</VStack>
          </Container>
        </VStack>
        <Footer />
      </VStack>
    </Box>
  );
}

export default App;
