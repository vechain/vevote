import { PageContainer } from "@/components/PageContainer";
import { useCreateProposal } from "./CreateProposalProvider";
import { CreateProposalStep } from "@/types/proposal";
import { ProposalDetailsForm } from "./ProposalDetailsForm";

import { ProposalSummaryForm } from "./ProposalSummaryForm";

export const CreateProposalContent = () => {
  const { step } = useCreateProposal();
  return (
    <PageContainer.Content>
      {step === CreateProposalStep.VOTING_DETAILS && <ProposalDetailsForm />}
      {step === CreateProposalStep.VOTING_SUMMARY && <ProposalSummaryForm />}
    </PageContainer.Content>
  );
};
