import { Box, VStack } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { Proposal } from "./pages/Proposal/Proposal";
import { Proposals } from "./pages/Proposals";
import { CreateProposal } from "./pages/CreateProposal/CreateProposal";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { Footer } from "./components/footer/Footer";
import { ScrollToTop } from "./components/ui/ScrollToTop";

const excludedRoutes = ["/create-proposal", "/admin"];

function Layout() {
  const { pathname } = useLocation();

  return (
    <Box h="full" bgColor="#f7f7f7">
      <ScrollToTop />
      <VStack minH="100vh" align="stretch">
        <Box flex="1">
          <Outlet />
        </Box>
        {!excludedRoutes.includes(pathname) && <Footer />}
      </VStack>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Proposals />,
      },
      {
        path: "proposal/:proposalId",
        element: <Proposal />,
      },
      {
        path: "create-proposal",
        element: <CreateProposal />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
