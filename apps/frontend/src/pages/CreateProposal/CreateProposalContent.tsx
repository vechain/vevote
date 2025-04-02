import { PageContainer } from "@/components/PageContainer";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button } from "@chakra-ui/react";
import { useCreateProposal } from "./CreateProposalProvider";

export const CreateProposalContent = () => {
  const { LL } = useI18nContext();
  const { setStep } = useCreateProposal();
  return (
    <PageContainer.Content>
      <Button onClick={() => setStep(prev => prev + 1)}>{LL.next()}</Button>
    </PageContainer.Content>
  );
};
