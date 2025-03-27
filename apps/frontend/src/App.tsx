import { Box, VStack } from "@chakra-ui/react";
import { Home } from "./pages/Home";
import { Footer } from "./components/footer/Footer";
import { Header } from "./components/navbar/Header";

function App() {
  return (
    <Box h="full" bgColor="#f7f7f7">
      <VStack minH="100vh" align="stretch">
        <Header />
        <Home />
        <Footer />
      </VStack>
    </Box>
  );
}

export default App;
