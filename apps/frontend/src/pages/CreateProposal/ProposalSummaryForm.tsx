import { useI18nContext } from "@/i18n/i18n-react";
import { CreateProposalStep } from "@/types/proposal";
import { Button, Flex, Icon } from "@chakra-ui/react";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { useCreateProposal } from "./CreateProposalProvider";
import { PublishButton } from "./PublishButton";
import { SummaryCard } from "./SummaryCard";
import { ArrowLeftIcon, EyeIcon } from "@/icons";
import { getFullDiscourseUrl } from "@/utils/discourse";

export const ProposalSummaryForm = () => {
  const { LL } = useI18nContext();
  const { proposalDetails, setStep, setOpenPreview } = useCreateProposal();

  return (
    <>
      <CreateFormWrapper gap={3} maxWidth={846}>
        <SummaryCard title={LL.proposal.create.summary_form.main_details.title()}>
          {proposalDetails.headerImage && (
            <SummaryCard.ImageItem
              label={LL.proposal.create.details_form.header_image()}
              value={proposalDetails.headerImage}
            />
          )}

          <SummaryCard.BaseItem label={LL.proposal.create.details_form.title()} value={proposalDetails.title} />
          <SummaryCard.BaseItem
            label={LL.proposal.create.details_form.description()}
            value={proposalDetails.description.map(op => op.insert).join("")}
            lineClamp={5}
          />

          {proposalDetails.discourseUrl && (
            <SummaryCard.BaseItem
              label={LL.proposal.create.details_form.discourse_url()}
              value={getFullDiscourseUrl(proposalDetails.discourseUrl)}
            />
          )}

          <SummaryCard.CalendarItem
            label={LL.proposal.create.details_form.voting_calendar()}
            startDate={proposalDetails.startDate}
            endDate={proposalDetails.endDate}
          />
        </SummaryCard>

        <Flex gap={4} marginTop={20} hideBelow={"md"}>
          <Button
            variant={"secondary"}
            onClick={() => setStep(CreateProposalStep.VOTING_DETAILS)}
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
      <Flex
        gap={6}
        width={"full"}
        maxWidth={"664px"}
        mx={"auto"}
        px={6}
        py={4}
        bgColor={{ base: "white" }}
        hideFrom={"md"}
        flexDir={"column"}>
        <Flex flexDirection={"row"} justifyContent={"space-between"}>
          <Button
            variant={"secondary"}
            onClick={() => setStep(CreateProposalStep.VOTING_DETAILS)}
            leftIcon={<Icon as={ArrowLeftIcon} />}>
            {LL.back()}
          </Button>
          <PublishButton />
        </Flex>
        <Button
          width={"full"}
          variant={"secondary"}
          onClick={() => setOpenPreview(true)}
          leftIcon={<Icon as={EyeIcon} />}>
          {LL.preview()}
        </Button>
      </Flex>
    </>
  );
};
