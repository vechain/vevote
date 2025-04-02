import { PageContainer } from "@/components/PageContainer";
import { CreateProposalProvider } from "./CreateProposalProvider";
import { CreateProposalNavigation } from "./CreateProposalNavigation";
import { CreateProposalContent } from "./CreateProposalContent";

export const CreateProposal = () => {
  return (
    <CreateProposalProvider>
      <PageContainer variant="full" padding={0}>
        <CreateProposalNavigation />
        <CreateProposalContent />
      </PageContainer>
    </CreateProposalProvider>
  );
};
