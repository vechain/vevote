import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { Label } from "@/components/ui/Label";
import { useI18nContext } from "@/i18n/i18n-react";
import { ProposalSetupSchema, proposalSetupSchema } from "@/schema/createProposalSchema";
import { CreateProposalStep } from "@/types/proposal";
import { Button, Flex, FormControl } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { VotingTypeSelectControlled } from "./controllers/VotingTypeSelectControlled";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { useCreateProposal } from "./CreateProposalProvider";

export const ProposalSetupForm = () => {
  const { proposalDetails, setStep } = useCreateProposal();
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;

  const defaultValues = useMemo(() => ({ ...proposalDetails }), [proposalDetails]);

  const onSubmit = (values: ProposalSetupSchema) => {
    console.log("values", values);
  };
  return (
    <FormSkeleton schema={proposalSetupSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ errors }) => {
        return (
          <CreateFormWrapper>
            <FormControl isInvalid={Boolean(errors.votingType)}>
              <Label label={LLSetupForm.voting_type()} />
              <Label.Subtitle label={LLSetupForm.voting_type_subtitle()} />
              <VotingTypeSelectControlled />
            </FormControl>
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
