import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { z } from "zod";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";
import { Button, Flex } from "@chakra-ui/react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { useI18nContext } from "@/i18n/i18n-react";
import { CreateProposalStep } from "@/types/proposal";

export const ProposalSetupForm = () => {
  const { proposalDetails, setStep } = useCreateProposal();
  const { LL } = useI18nContext();

  const schema = z.object({});

  const defaultValues = useMemo(() => ({ ...proposalDetails }), [proposalDetails]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    console.log("values", values);
  };
  return (
    <FormSkeleton schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {() => {
        return (
          <CreateFormWrapper>
            <Flex justifyContent={"space-between"}>
              <Button variant={"secondary"} onClick={() => setStep(CreateProposalStep.VOTING_DETAILS)}>
                <IoArrowBack />
                {LL.back()}
              </Button>
              <Button type="submit">
                {LL.next()}
                <IoArrowForward />
              </Button>
            </Flex>
          </CreateFormWrapper>
        );
      }}
    </FormSkeleton>
  );
};
