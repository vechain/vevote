import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { useMemo } from "react";
import { useCreateProposal } from "./CreateProposalProvider";
import { Button, Flex, FormControl, Icon, Input, Text, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { Label } from "@/components/ui/Label";
import { InputMessage } from "@/components/ui/InputMessage";
import { useI18nContext } from "@/i18n/i18n-react";
import { TextEditorControlled } from "./controllers/TextEditorControlled";
import { ImageUploadControlled } from "./controllers/ImageUploadControlled";
import { DateTimeInputControlled } from "./controllers/DateTimeInputControlled";
import { CreateProposalStep } from "@/types/proposal";
import { proposalDetailsSchema, ProposalDetailsSchema, TITLE_MAX_CHARS } from "@/schema/createProposalSchema";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { useProposalClock } from "@/hooks/useProposalClock";
import { getConfig } from "@repo/config";

const discourseBaseUrl = getConfig(import.meta.env.VITE_APP_ENV).discourseBaseUrl;

export const ProposalDetailsForm = () => {
  const { proposalDetails, setProposalDetails, setStep } = useCreateProposal();
  const { LL } = useI18nContext();
  const LLDetailsForm = LL.proposal.create.details_form;

  const { maxVotingDuration, minVotingDelay } = useProposalClock();

  const defaultValues = useMemo(
    () => ({
      title: proposalDetails?.title || "",
      description: proposalDetails?.description || [],
      headerImage: proposalDetails?.headerImage,
      discourseUrl: proposalDetails?.discourseUrl || "",
      startDate: proposalDetails?.startDate,
      endDate: proposalDetails?.endDate,
    }),
    [proposalDetails],
  );

  const schema = useMemo(
    () => proposalDetailsSchema(minVotingDelay, maxVotingDuration),
    [maxVotingDuration, minVotingDelay],
  );

  const onSubmit = (values: ProposalDetailsSchema) => {
    setProposalDetails({
      ...proposalDetails,
      ...values,
    });

    setStep(CreateProposalStep.VOTING_SUMMARY);
  };
  return (
    <FormSkeleton schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ register, errors, watch }) => {
        const title = watch("title");
        return (
          <>
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

              <FormControl isInvalid={Boolean(errors.discourseUrl)}>
                <Label label={LLDetailsForm.discourse_topic()} />
                <InputGroup flexDirection={{ base: "column", md: "row" }}>
                  <InputLeftAddon
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"start"}
                    backgroundColor={"gray.100"}
                    borderWidth={1}
                    borderColor={"gray.300"}
                    h={12}
                    p={4}>
                    {discourseBaseUrl}
                  </InputLeftAddon>
                  <Input placeholder={LLDetailsForm.discourse_topic_placeholder()} {...register("discourseUrl")} />
                </InputGroup>
                <InputMessage error={errors.discourseUrl?.message} message={LLDetailsForm.discourse_topic_help()} />
              </FormControl>

              <FormControl isInvalid={Boolean(errors.headerImage)}>
                <Label label={`${LLDetailsForm.header_image()} (${LL.optional()})`} />
                <ImageUploadControlled name="headerImage" />
              </FormControl>

              <Flex flexDirection={"column"} gap={4}>
                <Label label={LLDetailsForm.voting_calendar()} />

                <FormControl isInvalid={Boolean(errors.startDate)}>
                  <Text fontSize={{ base: 14, md: 16 }} color={"gray.600"} fontWeight={600} paddingBottom={2}>
                    {LL.start()}
                  </Text>
                  <DateTimeInputControlled name={"startDate"} />
                  <InputMessage error={errors.startDate?.message} />
                </FormControl>

                <FormControl isInvalid={Boolean(errors.endDate)}>
                  <Text fontSize={{ base: 14, md: 16 }} color={"gray.600"} fontWeight={600} paddingBottom={2}>
                    {LL.end()}
                  </Text>
                  <DateTimeInputControlled name={"endDate"} />
                  <InputMessage error={errors.endDate?.message} />
                </FormControl>
              </Flex>
              <Flex justifyContent={"space-between"} hideBelow={"md"}>
                <Button variant={"secondary"} disabled leftIcon={<Icon as={ArrowLeftIcon} />}>
                  {LL.back()}
                </Button>
                <Button type="submit" rightIcon={<Icon as={ArrowRightIcon} />}>
                  {LL.next()}
                </Button>
              </Flex>
            </CreateFormWrapper>
            <Flex
              hideFrom={"md"}
              width={"full"}
              mx={"auto"}
              px={6}
              py={4}
              bgColor={{ base: "white" }}
              justifyContent={"space-between"}>
              <Button variant={"secondary"} disabled leftIcon={<Icon as={ArrowLeftIcon} />}>
                {LL.back()}
              </Button>
              <Button type="submit" rightIcon={<Icon as={ArrowRightIcon} />}>
                {LL.next()}
              </Button>
            </Flex>
          </>
        );
      }}
    </FormSkeleton>
  );
};
