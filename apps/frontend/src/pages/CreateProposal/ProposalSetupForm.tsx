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
import { Box, Button, Flex, FormControl, Input, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { VotingTypeSelectControlled } from "./controllers/VotingTypeSelectControlled";
import { CreateFormWrapper } from "./CreateFormWrapper";
import { defaultSingleChoice, useCreateProposal } from "./CreateProposalProvider";
import { InputMessage } from "@/components/ui/InputMessage";
import { useFormContext } from "react-hook-form";
import { InputIncrementControlled } from "./controllers/InputLimitControlled";
import { VotingOptionsControlled } from "./VotingOptionsControlled";

export const ProposalSetupForm = () => {
  const { proposalDetails, setStep, setProposalDetails } = useCreateProposal();
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;

  const defaultValues = useMemo(() => ({ ...proposalDetails }), [proposalDetails]);

  const onSubmit = (values: ProposalSetupSchema) => {
    console.log(values);
    setProposalDetails({ ...proposalDetails, ...values });
  };
  return (
    <FormSkeleton schema={proposalSetupSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ errors, register, watch }) => {
        const { votingQuestion, votingType, votingOptions } = watch();
        const nextDisabled = votingOptions.filter(Boolean).length < 2;

        console.log(errors);

        return (
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

            <Flex justifyContent={"space-between"}>
              <Button variant={"secondary"} onClick={() => setStep(CreateProposalStep.VOTING_DETAILS)}>
                <IoArrowBack />
                {LL.back()}
              </Button>
              <Button type="submit" isDisabled={nextDisabled}>
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
              padding={6}
              key={choice}
              borderRadius={12}
              borderWidth={2}
              borderColor={"gray.200"}
              background={"gray.100"}>
              <Text fontSize={18} fontWeight={600} color={"gray.400"}>
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
    <>
      <Label label={LLSetupForm.voting_options()} />
      <Label.Subtitle label={LLSetupForm.voting_options_subtitle()} />
      <VotingOptionsControlled />
    </>
  );
};

const MultipleOptionFields = () => {
  const { LL } = useI18nContext();
  const LLSetupForm = LL.proposal.create.setup_form;
  const {
    formState: { errors },
  } = useFormContext<ProposalMultipleOptionSchema>();
  return (
    <>
      <FormControl isInvalid={Boolean(errors?.votingLimit)}>
        <Label label={LLSetupForm.voting_limit()} />
        <Label.Subtitle label={LLSetupForm.voting_limit_subtitle()} />
        <Label fontSize={16} label={LL.maximum()} />
        <InputIncrementControlled />
      </FormControl>
      <FormControl>
        <Label label={LLSetupForm.voting_options()} />
        <Label.Subtitle label={LLSetupForm.voting_options_subtitle()} />
        <VotingOptionsControlled />
      </FormControl>
    </>
  );
};
