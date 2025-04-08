import { Header } from "@/components/navbar/Header";
import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "../Home";
import { Proposals } from "../Proposals";
import { CreateProposal } from "../CreateProposal/CreateProposal";
import { Footer } from "@/components/footer/Footer";

const excludedRoutes = ["/create-proposal"];

export const Navigation = () => {
  const { pathname } = useLocation();

  return (
    <>
      {!excludedRoutes.includes(pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/create-proposal" element={<CreateProposal />} />
      </Routes>
      {!excludedRoutes.includes(pathname) && <Footer />}
    </>
  );
};
