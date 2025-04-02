import { Box, VStack } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { Navigation } from "./pages/Common/Navigation";

function App() {
  return (
    <Box h="full" bgColor="#f7f7f7">
      <VStack minH="100vh" align="stretch">
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>
      </VStack>
    </Box>
  );
}

export default App;
