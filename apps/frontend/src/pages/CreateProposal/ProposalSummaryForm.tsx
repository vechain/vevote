import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { useI18nContext } from "@/i18n/i18n-react";
import { useMemo } from "react";
import { z } from "zod";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { useCreateProposal } from "./CreateProposalProvider";
import { SummaryCard } from "./SummaryCard";
import { Button, Flex } from "@chakra-ui/react";
import { CreateProposalStep, VotingEnum } from "@/types/proposal";
import { IoArrowBack } from "react-icons/io5";

export const ProposalSummaryForm = () => {
  const { LL } = useI18nContext();
  const { proposalDetails, setStep } = useCreateProposal();

  const schema = z.object({});

  const defaultValues = useMemo(() => ({ ...proposalDetails }), [proposalDetails]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    console.log("values", values);
  };
  return (
    <FormSkeleton schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {() => {
        return (
          <CreateFormWrapper gap={3} maxWidth={846}>
            <SummaryCard title={LL.proposal.create.summary_form.main_details.title()}>
              <SummaryCard.BaseItem label={LL.proposal.create.details_form.title()} value={proposalDetails.title} />
              <SummaryCard.BaseItem
                label={LL.proposal.create.details_form.description()}
                value={proposalDetails.description.map(op => op.insert).join("")}
                lineClamp={5}
              />
              <SummaryCard.ImageItem
                label={LL.proposal.create.details_form.header_image()}
                value={proposalDetails.headerImage}
              />
              <SummaryCard.CalendarItem
                label={LL.proposal.create.details_form.voting_calendar()}
                startDate={proposalDetails.startDate}
                endDate={proposalDetails.endDate}
              />
            </SummaryCard>

            <SummaryCard title={LL.proposal.create.summary_form.voting_setup.title()}>
              <SummaryCard.BaseItem
                label={LL.proposal.create.summary_form.voting_setup.type()}
                value={LL.proposal.create.summary_form.voting_setup.types[proposalDetails.votingType]()}
              />
              <SummaryCard.BaseItem
                label={LL.proposal.create.summary_form.voting_setup.question()}
                value={proposalDetails.votingQuestion}
                lineClamp={3}
              />

              {proposalDetails.votingType === VotingEnum.MULTIPLE_OPTIONS && proposalDetails.votingLimit && (
                <SummaryCard.BaseItem
                  label={LL.proposal.create.setup_form.voting_limit()}
                  value={LL.proposal.create.summary_form.voting_setup.maximum({ limit: proposalDetails.votingLimit })}
                />
              )}

              <SummaryCard.OptionsItem
                label={LL.proposal.create.setup_form.voting_options()}
                votingType={proposalDetails.votingType}
                votingOptions={proposalDetails.votingOptions}
              />
            </SummaryCard>

            <Flex justifyContent={"space-between"}>
              <Button variant={"secondary"} onClick={() => setStep(CreateProposalStep.VOTING_SETUP)}>
                <IoArrowBack />
                {LL.back()}
              </Button>
              {/* <Button type="submit" isDisabled={nextDisabled}>
                {LL.next()}
                <IoArrowForward  />
              </Button> */}
            </Flex>
          </CreateFormWrapper>
        );
      }}
    </FormSkeleton>
  );
};
