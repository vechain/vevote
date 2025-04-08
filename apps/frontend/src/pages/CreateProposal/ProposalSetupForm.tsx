import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { z } from "zod";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";

export const ProposalSetupForm = () => {
  const { proposalDetails } = useCreateProposal();

  const schema = z.object({});

  const defaultValues = useMemo(() => ({ ...proposalDetails }), [proposalDetails]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    console.log("values", values);
  };
  return (
    <FormSkeleton schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {() => {
        return <CreateFormWrapper>{"setup"}</CreateFormWrapper>;
      }}
    </FormSkeleton>
  );
};
