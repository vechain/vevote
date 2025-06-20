import { PageContainer } from "@/components/PageContainer";
import { CreateProposalNavigation } from "./CreateProposalNavigation";
import { CreateProposalContent } from "./CreateProposalContent";
import { useCreateProposal } from "./CreateProposalProvider";
import { ProposalPreview } from "./ProposalPreview";
import { useEffect } from "react";
import { analytics } from "@/utils/mixpanel/mixpanel";

export const CreateProposal = () => {
  const { openPreview } = useCreateProposal();
  useEffect(() => {
    analytics.trackPageView(`Create Proposal page viewed`);
  }, []);
  return (
    <>
      {!openPreview ? (
        <PageContainer variant="full" padding={0} gap={0}>
          <CreateProposalNavigation />
          <CreateProposalContent />
        </PageContainer>
      ) : (
        <ProposalPreview />
      )}
    </>
  );
};
