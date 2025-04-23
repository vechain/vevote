import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";
import { Button, Flex, FormControl, Input, Text } from "@chakra-ui/react";
import { Label } from "@/components/ui/Label";
import { InputMessage } from "@/components/ui/InputMessage";
import { useI18nContext } from "@/i18n/i18n-react";
import { TextEditorControlled } from "./controllers/TextEditorControlled";
import { ImageUploadControlled } from "./controllers/ImageUploadControlled";
import { DateTimeInputControlled } from "./controllers/DateTimeInputControlled";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { CreateProposalStep } from "@/types/proposal";
import { proposalDetailsSchema, ProposalDetailsSchema, TITLE_MAX_CHARS } from "@/schema/createProposalSchema";

export const ProposalDetailsForm = () => {
  const { proposalDetails, setProposalDetails, setStep } = useCreateProposal();
  const { LL } = useI18nContext();
  const LLDetailsForm = LL.proposal.create.details_form;

  const defaultValues = useMemo(
    () => ({
      title: proposalDetails?.title || "",
      description: proposalDetails?.description || [],
      headerImage: proposalDetails?.headerImage,
      startDate: proposalDetails?.startDate,
      endDate: proposalDetails?.endDate,
    }),
    [proposalDetails],
  );

  const onSubmit = (values: ProposalDetailsSchema) => {
    setProposalDetails({
      ...proposalDetails,
      ...values,
    });

    setStep(CreateProposalStep.VOTING_SETUP);
  };
  return (
    <FormSkeleton schema={proposalDetailsSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ register, errors, watch }) => {
        const title = watch("title");
        return (
          <CreateFormWrapper>
            <FormControl isInvalid={Boolean(errors.title)}>
              <Label label={LLDetailsForm.title()} />
              <Input width={"full"} placeholder={LLDetailsForm.title_placeholder()} {...register("title")} />
              <InputMessage
                error={errors.title?.message}
                message={LL.filed_length({ current: title.length, max: TITLE_MAX_CHARS })}
              />
            </FormControl>

            <FormControl isInvalid={Boolean(errors.description)}>
              <Label label={LLDetailsForm.description()} />
              <TextEditorControlled<ProposalDetailsSchema> name="description" />
              <InputMessage error={errors.description?.message} />
            </FormControl>

            <FormControl isInvalid={Boolean(errors.headerImage)}>
              <Label label={LLDetailsForm.header_image()} />
              <ImageUploadControlled name="headerImage" />
            </FormControl>

            <Flex flexDirection={"column"} gap={4}>
              <Label label={LLDetailsForm.voting_calendar()} />

              <FormControl isInvalid={Boolean(errors.startDate)}>
                <Text color={"gray.600"} fontWeight={600} paddingBottom={2}>
                  {LL.start()}
                </Text>
                <DateTimeInputControlled name={"startDate"} />
                <InputMessage error={errors.startDate?.message} />
              </FormControl>

              <FormControl isInvalid={Boolean(errors.endDate)}>
                <Text color={"gray.600"} fontWeight={600} paddingBottom={2}>
                  {LL.end()}
                </Text>
                <DateTimeInputControlled name={"endDate"} />
                <InputMessage error={errors.endDate?.message} />
              </FormControl>
            </Flex>

            <Flex justifyContent={"space-between"}>
              <Button variant={"secondary"} disabled>
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
