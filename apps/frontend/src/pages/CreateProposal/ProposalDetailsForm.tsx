import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { z } from "zod";
import { zodFile } from "@/utils/zod";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";

export const ProposalDetailsForm = () => {
  const { proposalDetails } = useCreateProposal();

  const schema = z.object({
    title: z.string(),
    description: z.string(),
    headerImage: zodFile.optional(),
    startDate: z.date(),
    endDate: z.date(),
  });

  const defaultValues = useMemo(
    () => ({
      title: proposalDetails?.title,
      description: proposalDetails?.description,
      headerImage: proposalDetails?.headerImage,
      startDate: proposalDetails?.startDate,
      endDate: proposalDetails?.endDate,
    }),
    [proposalDetails],
  );

  const onSubmit = (values: z.infer<typeof schema>) => {
    console.log("values", values);
  };
  return (
    <FormSkeleton schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {() => {
        return <CreateFormWrapper>{"details"}</CreateFormWrapper>;
      }}
    </FormSkeleton>
  );
};
