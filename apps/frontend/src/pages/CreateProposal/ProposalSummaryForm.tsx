import { useI18nContext } from "@/i18n/i18n-react";
import { CreateProposalStep, VotingEnum } from "@/types/proposal";
import { Button, Flex, Icon } from "@chakra-ui/react";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { useCreateProposal } from "./CreateProposalProvider";
import { PublishButton } from "./PublishButton";
import { SummaryCard } from "./SummaryCard";
import { ArrowLeftIcon, EyeIcon } from "@/icons";

export const ProposalSummaryForm = () => {
  const { LL } = useI18nContext();
  const { proposalDetails, setStep, setOpenPreview } = useCreateProposal();

  return (
    <CreateFormWrapper gap={3} maxWidth={846}>
      <SummaryCard title={LL.proposal.create.summary_form.main_details.title()}>
        <SummaryCard.ImageItem
          label={LL.proposal.create.details_form.header_image()}
          value={proposalDetails.headerImage}
        />
        <SummaryCard.BaseItem label={LL.proposal.create.details_form.title()} value={proposalDetails.title} />
        <SummaryCard.BaseItem
          label={LL.proposal.create.details_form.description()}
          value={proposalDetails.description.map(op => op.insert).join("")}
          lineClamp={5}
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
            value={LL.proposal.create.summary_form.voting_setup.maximum({
              limit: proposalDetails.votingLimit,
            })}
          />
        )}

        <SummaryCard.OptionsItem
          label={LL.proposal.create.setup_form.voting_options()}
          votingType={proposalDetails.votingType}
          votingOptions={proposalDetails.votingOptions}
        />
      </SummaryCard>

      <Flex gap={4} marginTop={20}>
        <Button
          variant={"secondary"}
          onClick={() => setStep(CreateProposalStep.VOTING_SETUP)}
          leftIcon={<Icon as={ArrowLeftIcon} />}>
          {LL.back()}
        </Button>
        <Button
          variant={"secondary"}
          marginLeft={"auto"}
          onClick={() => setOpenPreview(true)}
          leftIcon={<Icon as={EyeIcon} />}>
          {LL.preview()}
        </Button>
        <PublishButton />
      </Flex>
    </CreateFormWrapper>
  );
};
