import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { Label } from "@/components/ui/Label";
import { useI18nContext } from "@/i18n/i18n-react";
import {
  ProposalMultipleOptionSchema,
  ProposalSetupSchema,
  proposalSetupSchema,
  ProposalSingleChoiceSchema,
  QUESTION_MAX_CHAR,
} from "@/schema/createProposalSchema";
import { CreateProposalStep, VotingEnum } from "@/types/proposal";
import { Box, Button, Flex, FormControl, Icon, Input, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { VotingTypeSelectControlled } from "./controllers/VotingTypeSelectControlled";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { defaultSingleChoice, useCreateProposal } from "./CreateProposalProvider";
import { InputMessage } from "@/components/ui/InputMessage";
import { useFormContext } from "react-hook-form";
import { InputLimitControlled, InputMinControlled } from "./controllers/InputLimitControlled";
import { VotingOptionsControlled } from "./VotingOptionsControlled";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";

export const ProposalSetupForm = () => {
  const { proposalDetails, setStep, setProposalDetails } = useCreateProposal();
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;

  const defaultValues = useMemo(() => ({ ...proposalDetails }), [proposalDetails]);

  const onSubmit = useCallback(
    (values: ProposalSetupSchema) => {
      setProposalDetails({ ...proposalDetails, ...values });
      setStep(CreateProposalStep.VOTING_SUMMARY);
    },
    [proposalDetails, setProposalDetails, setStep],
  );
  return (
    <FormSkeleton schema={proposalSetupSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ errors, register, watch }) => {
        const { votingQuestion, votingType, votingOptions } = watch();
        const nextDisabled = votingOptions.filter(Boolean).length < 2;

        return (
          <>
            <CreateFormWrapper>
              <FormControl isInvalid={Boolean(errors.votingType)}>
                <Label label={LLSetupForm.voting_type()} />
                <Label.Subtitle label={LLSetupForm.voting_type_subtitle()} />
                <VotingTypeSelectControlled />
              </FormControl>

              <FormControl isInvalid={Boolean(errors.votingQuestion)}>
                <Label label={LLSetupForm.voting_question()} />
                <Label.Subtitle label={LLSetupForm.voting_question_subtitle()} />
                <Input
                  width={"full"}
                  placeholder={LLSetupForm.voting_question_placeholder()}
                  {...register("votingQuestion")}
                />
                <InputMessage
                  error={errors.votingQuestion?.message}
                  message={LL.filed_length({ current: (votingQuestion ?? "").length, max: QUESTION_MAX_CHAR })}
                />
              </FormControl>

              {votingType === VotingEnum.SINGLE_CHOICE && <SingleChoiceFields />}
              {votingType === VotingEnum.SINGLE_OPTION && <SingleOptionsFields />}
              {votingType === VotingEnum.MULTIPLE_OPTIONS && <MultipleOptionFields />}

              <Flex justifyContent={"space-between"} hideBelow={"md"}>
                <Button
                  variant={"secondary"}
                  onClick={() => setStep(CreateProposalStep.VOTING_DETAILS)}
                  leftIcon={<Icon as={ArrowLeftIcon} />}>
                  {LL.back()}
                </Button>
                <Button type="submit" isDisabled={nextDisabled} rightIcon={<Icon as={ArrowRightIcon} />}>
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

const SingleChoiceFields = () => {
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;
  const {
    formState: { errors },
  } = useFormContext<ProposalSingleChoiceSchema>();
  return (
    <>
      <FormControl isInvalid={Boolean(errors?.votingOptions)}>
        <Label label={LLSetupForm.voting_options()} />
        <Label.Subtitle label={LLSetupForm.voting_choice_subtitle()} />
        <Flex flexDirection={"column"} gap={2}>
          {defaultSingleChoice.map(choice => (
            <Box
              padding={{ base: 4, md: 6 }}
              key={choice}
              borderRadius={12}
              borderWidth={2}
              borderColor={"gray.200"}
              background={"gray.100"}>
              <Text fontSize={{ base: 14, md: 18 }} fontWeight={600} color={"gray.400"}>
                {choice}
              </Text>
            </Box>
          ))}
        </Flex>
      </FormControl>
    </>
  );
};

const SingleOptionsFields = () => {
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;
  return (
    <FormControl>
      <Label label={LLSetupForm.voting_options()} />
      <Label.Subtitle label={LLSetupForm.voting_options_subtitle()} />
      <VotingOptionsControlled />
    </FormControl>
  );
};

const MultipleOptionFields = () => {
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ProposalMultipleOptionSchema>();

  const { votingOptions, votingMin, votingLimit } = watch();

  const onDeleteEnd = useCallback(() => {
    const optionsLength = votingOptions.length - 1;

    console.log("onDeleteEnd called", { optionsLength, votingLimit, votingMin });

    if (optionsLength < votingLimit) setValue("votingLimit", optionsLength);
    if (optionsLength < votingMin) setValue("votingMin", optionsLength);
  }, [votingOptions, votingLimit, votingMin, setValue]);
  return (
    <>
      <Flex flexDirection={"column"} alignItems={"start"} gap={2}>
        <Label label={LLSetupForm.voting_limit()} />
        <Label.Subtitle label={LLSetupForm.voting_limit_subtitle()} />
        <Flex alignItems={"center"} gap={4}>
          <FormControl isInvalid={Boolean(errors?.votingMin)}>
            <Label fontSize={16} label={LL.minimum()} />
            <InputMinControlled isMinDisable={votingMin <= 1} isMaxDisable={votingMin >= votingOptions.length} />
          </FormControl>
          <FormControl isInvalid={Boolean(errors?.votingLimit)}>
            <Label fontSize={16} label={LL.maximum()} />
            <InputLimitControlled
              isMinDisable={votingLimit <= votingMin}
              isMaxDisable={votingLimit >= votingOptions.length}
            />
          </FormControl>
        </Flex>
      </Flex>

      <FormControl>
        <Label label={LLSetupForm.voting_options()} />
        <Label.Subtitle label={LLSetupForm.voting_options_subtitle()} />
        <VotingOptionsControlled onDeleteEnd={onDeleteEnd} />
      </FormControl>
    </>
  );
};
