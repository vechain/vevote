import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  Box,
  Text,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useGovernanceSettings } from "@/hooks/useGovernanceSettings";
import { useFormatTime } from "@/hooks/useFormatTime";
import { FixedPointNumber, Units } from "@vechain/sdk-core";
import { AdminCard } from "../common/AdminCard";
import { VeVoteInfo } from "../../services";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";

interface GovernanceSettingsFormProps {
  veVoteInfo: VeVoteInfo;
  onSuccess?: () => void;
}

const BaseNumberInputStepper = () => {
  return (
    <NumberInputStepper>
      <NumberIncrementStepper h={2} />
      <NumberDecrementStepper h={2} />
    </NumberInputStepper>
  );
};

export function GovernanceSettingsForm({ veVoteInfo, onSuccess }: GovernanceSettingsFormProps) {
  const { LL } = useI18nContext();
  const { sendTransaction, isTransactionPending } = useGovernanceSettings();
  const { formatTime } = useFormatTime();

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formValues, setFormValues] = useState({
    quorumNumerator: "",
    minVotingDelay: "",
    minVotingDuration: "",
    maxVotingDuration: "",
    minStakedVetAmount: "",
  });

  const hasChanges =
    formValues.quorumNumerator !== "" ||
    formValues.minVotingDelay !== "" ||
    formValues.minVotingDuration !== "" ||
    formValues.maxVotingDuration !== "" ||
    formValues.minStakedVetAmount !== "";

  const handleSubmit = useCallback(async () => {
    try {
      setErrorMessage("");

      const updateParams: {
        updateQuorumNumerator?: number;
        setMinVotingDelay?: number;
        setMinVotingDuration?: number;
        setMaxVotingDuration?: number;
        setMinStakedVetAmount?: bigint;
      } = {};

      if (formValues.quorumNumerator && Number(formValues.quorumNumerator) !== Number(veVoteInfo.quorumNumerator)) {
        updateParams.updateQuorumNumerator = Number(formValues.quorumNumerator);
      }

      if (formValues.minVotingDelay && Number(formValues.minVotingDelay) !== veVoteInfo.minVotingDelay) {
        updateParams.setMinVotingDelay = Number(formValues.minVotingDelay);
      }

      if (formValues.minVotingDuration && Number(formValues.minVotingDuration) !== veVoteInfo.minVotingDuration) {
        updateParams.setMinVotingDuration = Number(formValues.minVotingDuration);
      }

      if (formValues.maxVotingDuration && Number(formValues.maxVotingDuration) !== veVoteInfo.maxVotingDuration) {
        updateParams.setMaxVotingDuration = Number(formValues.maxVotingDuration);
      }

      if (formValues.minStakedVetAmount) {
        const newValue = BigInt(formValues.minStakedVetAmount);
        if (newValue !== veVoteInfo.minStakedAmount) {
          updateParams.setMinStakedVetAmount = newValue;
        }
      }

      if (Object.keys(updateParams).length === 0) return;

      await sendTransaction(updateParams);
      onSuccess?.();

      setFormValues({
        quorumNumerator: "",
        minVotingDelay: "",
        minVotingDuration: "",
        maxVotingDuration: "",
        minStakedVetAmount: "",
      });
    } catch (err) {
      const error = err as { error?: { message: string }; message: string };
      setErrorMessage(
        error?.error?.message ||
          error?.message ||
          LL.admin.governance_settings.error_description({ error: LL.admin.unknown_error() }),
      );
    }
  }, [
    veVoteInfo,
    formValues.quorumNumerator,
    formValues.minVotingDelay,
    formValues.minVotingDuration,
    formValues.maxVotingDuration,
    formValues.minStakedVetAmount,
    sendTransaction,
    onSuccess,
    LL.admin,
  ]);

  return (
    <AdminCard title={LL.admin.governance_settings.title()} maxW={"full"}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="sm" color="gray.600">
          {LL.admin.governance_settings.description()}
        </Text>

        {errorMessage && (
          <GenericInfoBox variant="error">
            <Text color="red.700">{errorMessage}</Text>
          </GenericInfoBox>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>{LL.admin.governance_settings.quorum_numerator_label()}</FormLabel>
            <NumberInput
              value={formValues.quorumNumerator}
              onChange={value => setFormValues(prev => ({ ...prev, quorumNumerator: value }))}
              min={1}>
              <NumberInputField placeholder={veVoteInfo.quorumNumerator.toString()} />
              <BaseNumberInputStepper />
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.quorum_numerator_help({ current: Number(veVoteInfo.quorumNumerator) })}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{LL.admin.governance_settings.min_voting_delay_label()}</FormLabel>
            <NumberInput
              value={formValues.minVotingDelay}
              onChange={value => setFormValues(prev => ({ ...prev, minVotingDelay: value }))}
              min={0}>
              <NumberInputField placeholder={veVoteInfo.minVotingDelay.toString()} />
              <BaseNumberInputStepper />
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.min_voting_delay_help()}
              <br />
              Current: {`${veVoteInfo.minVotingDelay} (${formatTime(veVoteInfo.minVotingDelay * 10)})`}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{LL.admin.governance_settings.min_voting_duration_label()}</FormLabel>
            <NumberInput
              value={formValues.minVotingDuration}
              onChange={value => setFormValues(prev => ({ ...prev, minVotingDuration: value }))}
              min={1}>
              <NumberInputField placeholder={veVoteInfo.minVotingDuration.toString()} />
              <BaseNumberInputStepper />
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.min_voting_duration_help()}
              <br />
              Current: {`${veVoteInfo.minVotingDuration} (${formatTime(veVoteInfo.minVotingDuration * 10)})`}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{LL.admin.governance_settings.max_voting_duration_label()}</FormLabel>
            <NumberInput
              value={formValues.maxVotingDuration}
              onChange={value => setFormValues(prev => ({ ...prev, maxVotingDuration: value }))}
              min={1}>
              <NumberInputField placeholder={veVoteInfo.maxVotingDuration.toString()} />
              <BaseNumberInputStepper />
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.max_voting_duration_help()}
              <br />
              Current: {`${veVoteInfo.maxVotingDuration} (${formatTime(veVoteInfo.maxVotingDuration * 10)})`}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{LL.admin.governance_settings.min_staked_vet_amount_label()}</FormLabel>
            <NumberInput
              value={formValues.minStakedVetAmount}
              onChange={value => setFormValues(prev => ({ ...prev, minStakedVetAmount: value }))}
              min={0}
              step={1000}>
              <NumberInputField placeholder={Units.formatEther(FixedPointNumber.of(veVoteInfo.minStakedAmount))} />
              <BaseNumberInputStepper />
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.min_staked_vet_amount_help()}
              <br />
              Current:{" "}
              {LL.admin.vet_format({ amount: Units.formatEther(FixedPointNumber.of(veVoteInfo.minStakedAmount)) })}
            </FormHelperText>
          </FormControl>
        </SimpleGrid>

        <Box>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSubmit}
            isLoading={isTransactionPending}
            loadingText={LL.admin.governance_settings.updating()}
            isDisabled={!hasChanges}>
            {LL.admin.governance_settings.update_governance_settings()}
          </Button>
        </Box>
      </VStack>
    </AdminCard>
  );
}
