import { PageContainer } from "@/components/PageContainer";
import { CreateProposalNavigation } from "./CreateProposalNavigation";
import { CreateProposalContent } from "./CreateProposalContent";
import { useCreateProposal } from "./CreateProposalProvider";
import { ProposalPreview } from "./ProposalPreview";

export const CreateProposal = () => {
  const { openPreview } = useCreateProposal();
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
