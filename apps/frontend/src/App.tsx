import { Box, VStack } from "@chakra-ui/react";
import { Home } from "./pages/Home";
import { Footer } from "./components/footer/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Proposals } from "./pages/Proposals";
import { Header } from "./components/navbar/Header.tsx";

function App() {
  return (
    <Box h="full" bgColor="#f7f7f7">
      <VStack minH="100vh" align="stretch">
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/proposals" element={<Proposals />} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </VStack>
    </Box>
  );
}

export default App;
