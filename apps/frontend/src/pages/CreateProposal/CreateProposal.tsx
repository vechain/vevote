import { PageContainer } from "@/components/PageContainer";
import { CreateProposalNavigation } from "./CreateProposalNavigation";
import { CreateProposalContent } from "./CreateProposalContent";

export const CreateProposal = () => {
  return (
    <PageContainer variant="full" padding={0} gap={0}>
      <CreateProposalNavigation />
      <CreateProposalContent />
    </PageContainer>
  );
};
