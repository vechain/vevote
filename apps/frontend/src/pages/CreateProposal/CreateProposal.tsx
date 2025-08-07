import { PageContainer } from "@/components/PageContainer";
import { CreateProposalNavigation } from "./CreateProposalNavigation";
import { CreateProposalContent } from "./CreateProposalContent";
import { useCreateProposal } from "./CreateProposalProvider";
import { ProposalPreview } from "../Proposal/ProposalPreview";
import { useEffect } from "react";
import { useWallet } from "@vechain/vechain-kit";
import { useUser } from "@/contexts/UserProvider";
import { useNavigate } from "react-router-dom";
import { Routes } from "@/types/routes";

export const CreateProposal = () => {
  const { openPreview } = useCreateProposal();
  const { account } = useWallet();
  const { isWhitelisted } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (!account?.address || !isWhitelisted) {
      navigate(Routes.HOME);
    }
  }, [account?.address, isWhitelisted, navigate]);
  return (
    <>
      {!openPreview ? (
        <PageContainer variant="full" padding={{ base: 0, md: 0 }} gap={0} paddingTop={{ base: 0, md: 0 }}>
          <CreateProposalNavigation />
          <CreateProposalContent />
        </PageContainer>
      ) : (
        <ProposalPreview />
      )}
    </>
  );
};
