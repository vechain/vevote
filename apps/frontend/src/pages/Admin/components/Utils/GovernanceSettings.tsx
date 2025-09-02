import {
  Box,
  Heading,
  Text,
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
  useDisclosure,
  Alert,
  AlertIcon,
  VStack,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useVeVoteInfo } from "../../hooks";
import { useGovernanceSettings } from "@/hooks/useGovernanceSettings";
import { MessageModal } from "@/components/ui/ModalSkeleton";
import { CheckIcon } from "@/icons";

export function GovernanceSettings() {
  const { LL } = useI18nContext();
  const { data: veVoteInfo, isLoading, error } = useVeVoteInfo();
  const { sendTransaction, isTransactionPending } = useGovernanceSettings();

  const { isOpen: isSuccessOpen, onClose: onSuccessClose, onOpen: onSuccessOpen } = useDisclosure();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [formValues, setFormValues] = useState({
    quorumNumerator: "",
    minVotingDelay: "",
    minVotingDuration: "",
    maxVotingDuration: "",
  });

  const handleSubmit = useCallback(async () => {
    if (!veVoteInfo) return;

    try {
      setErrorMessage("");

      const updateParams: any = {};

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

      if (Object.keys(updateParams).length === 0) {
        return; // No changes to update
      }

      await sendTransaction(updateParams);
      onSuccessOpen();

      setFormValues({
        quorumNumerator: "",
        minVotingDelay: "",
        minVotingDuration: "",
        maxVotingDuration: "",
      });
    } catch (error: any) {
      setErrorMessage(
        error?.error?.message ||
          error?.message ||
          LL.admin.governance_settings.error_description({ error: "Unknown error" }),
      );
    }
  }, [formValues, veVoteInfo, sendTransaction, onSuccessOpen, LL.admin.governance_settings]);

  if (isLoading) {
    return (
      <Box>
        <Text>{LL.admin.vevote_contract.loading()}</Text>
      </Box>
    );
  }

  if (error || !veVoteInfo) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error instanceof Error ? error.message : LL.admin.vevote_contract.no_data()}
      </Alert>
    );
  }

  const hasChanges = Object.values(formValues).some(value => value !== "");

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
            {LL.admin.governance_settings.title()}
          </Heading>
          <Text fontSize="sm" color="gray.600">
            {LL.admin.governance_settings.description()}
          </Text>
        </Box>

        {errorMessage && (
          <Alert status="error">
            <AlertIcon />
            {errorMessage}
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>{LL.admin.governance_settings.quorum_numerator_label()}</FormLabel>
            <NumberInput
              value={formValues.quorumNumerator}
              onChange={value => setFormValues(prev => ({ ...prev, quorumNumerator: value }))}
              min={1}>
              <NumberInputField placeholder={veVoteInfo.quorumNumerator.toString()} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
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
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.min_voting_delay_help()}
              <br />
              Current:{" "}
              {LL.admin.format_minutes_seconds({
                minutes: Math.floor(veVoteInfo.minVotingDelay / 60),
                seconds: veVoteInfo.minVotingDelay,
              })}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{LL.admin.governance_settings.min_voting_duration_label()}</FormLabel>
            <NumberInput
              value={formValues.minVotingDuration}
              onChange={value => setFormValues(prev => ({ ...prev, minVotingDuration: value }))}
              min={1}>
              <NumberInputField placeholder={veVoteInfo.minVotingDuration.toString()} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.min_voting_duration_help()}
              <br />
              Current:{" "}
              {LL.admin.format_minutes_seconds({
                minutes: Math.floor(veVoteInfo.minVotingDuration / 60),
                seconds: veVoteInfo.minVotingDuration,
              })}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{LL.admin.governance_settings.max_voting_duration_label()}</FormLabel>
            <NumberInput
              value={formValues.maxVotingDuration}
              onChange={value => setFormValues(prev => ({ ...prev, maxVotingDuration: value }))}
              min={1}>
              <NumberInputField placeholder={veVoteInfo.maxVotingDuration.toString()} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              {LL.admin.governance_settings.max_voting_duration_help()}
              <br />
              Current: {LL.admin.format_days({ number: Math.round(veVoteInfo.maxVotingDuration / 86400) })}
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
            {LL.admin.governance_settings.update_settings()}
          </Button>
        </Box>
      </VStack>

      <MessageModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        icon={CheckIcon}
        iconColor="primary.500"
        title={LL.admin.governance_settings.success_title()}>
        <Text textAlign="center" fontSize={14} color="gray.600">
          {LL.admin.governance_settings.success_description()}
        </Text>
      </MessageModal>
    </Box>
  );
}
