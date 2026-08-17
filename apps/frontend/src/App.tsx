import { Box, VStack } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { Proposal } from "./pages/Proposal/Proposal";
import { Proposals } from "./pages/Proposals";
import { CreateProposal } from "./pages/CreateProposal/CreateProposal";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { Footer } from "./components/footer/Footer";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { useVoteCastInvalidate } from "./hooks/useVoteCastInvalidate";
import { useProposalCreatedInvalidate } from "./hooks/useProposalCreatedInvalidate";
import { CookieBanner } from "./components/consent/CookieBanner";
import { CookiePreferencesModal } from "./components/consent/CookiePreferencesModal";
import { MAIN_CONTENT_ID, SkipToContent } from "./components/ui/SkipToContent";

const excludedRoutes = ["/create-proposal", "/admin"];

function Layout() {
  const { pathname } = useLocation();

  useVoteCastInvalidate();
  useProposalCreatedInvalidate();

  return (
    <Box h="full" bgColor="#f7f7f7">
      <ScrollToTop />
      <SkipToContent />
      <VStack minH="100vh" align="stretch">
        {/* `tabIndex={-1}` makes the skip link's target focusable. */}
        <Box as="main" id={MAIN_CONTENT_ID} tabIndex={-1} flex="1" outline="none">
          <Outlet />
        </Box>
        {!excludedRoutes.includes(pathname) && <Footer />}
      </VStack>
      <CookieBanner />
      <CookiePreferencesModal />
    </Box>
  );
}

const router = createBrowserRouter(
  [
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
  ],
  { basename: import.meta.env.VITE_BASE_PATH },
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
