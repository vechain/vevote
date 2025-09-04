import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { InputMessage } from "@/components/ui/InputMessage";
import { Label } from "@/components/ui/Label";
import { useFormatTime } from "@/hooks/useFormatTime";
import { useGovernanceSettings } from "@/hooks/useGovernanceSettings";
import { useI18nContext } from "@/i18n/i18n-react";
import { governanceSettingsSchema, GovernanceSettingsSchema } from "@/schema/adminSchema";
import { Box, Button, FormControl, NumberInput, NumberInputField, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FixedPointNumber, Units } from "@vechain/sdk-core";
import { useCallback, useMemo } from "react";
import { VeVoteInfo } from "../../services";
import { AdminCard } from "../common/AdminCard";
import { SensitiveWarning } from "../common/SensitiveWarning";

interface GovernanceSettingsFormProps {
  veVoteInfo: VeVoteInfo;
  onSuccess?: () => void;
}

export function GovernanceSettingsForm({ veVoteInfo, onSuccess }: GovernanceSettingsFormProps) {
  const { LL } = useI18nContext();
  const { sendTransaction, isTransactionPending } = useGovernanceSettings();
  const { formatTime } = useFormatTime();

  const defaultValues = useMemo(
    () => ({
      quorumNumerator: undefined,
      minVotingDelay: undefined,
      minVotingDuration: undefined,
      maxVotingDuration: undefined,
      minStakedVetAmount: undefined,
    }),
    [],
  );

  const onSubmit = useCallback(
    async (values: GovernanceSettingsSchema) => {
      const updateParams: {
        updateQuorumNumerator?: number;
        setMinVotingDelay?: number;
        setMinVotingDuration?: number;
        setMaxVotingDuration?: number;
        setMinStakedVetAmount?: bigint;
      } = {};

      if (values.quorumNumerator && values.quorumNumerator !== Number(veVoteInfo.quorumNumerator)) {
        updateParams.updateQuorumNumerator = values.quorumNumerator;
      }

      if (values.minVotingDelay && values.minVotingDelay !== veVoteInfo.minVotingDelay) {
        updateParams.setMinVotingDelay = values.minVotingDelay;
      }

      if (values.minVotingDuration && values.minVotingDuration !== veVoteInfo.minVotingDuration) {
        updateParams.setMinVotingDuration = values.minVotingDuration;
      }

      if (values.maxVotingDuration && values.maxVotingDuration !== veVoteInfo.maxVotingDuration) {
        updateParams.setMaxVotingDuration = values.maxVotingDuration;
      }

      if (values.minStakedVetAmount) {
        const newValue = BigInt(values.minStakedVetAmount);
        if (newValue !== veVoteInfo.minStakedAmount) {
          updateParams.setMinStakedVetAmount = newValue;
        }
      }

      if (Object.keys(updateParams).length === 0) return;

      await sendTransaction(updateParams);
      onSuccess?.();
    },
    [veVoteInfo, sendTransaction, onSuccess],
  );

  return (
    <AdminCard title={LL.admin.governance_settings.title()} maxWidth={"full"} minWidth={{ base: "100%", lg: "600px" }}>
      <Text fontSize="sm" color="gray.600" mb={6}>
        {LL.admin.governance_settings.description()}
      </Text>

      <FormSkeleton schema={governanceSettingsSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
        {({ register, errors, isDirty }) => {
          return (
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isInvalid={!!errors.quorumNumerator}>
                  <Label label={LL.admin.governance_settings.quorum_numerator_label()} />
                  <NumberInput min={1}>
                    <NumberInputField
                      placeholder={veVoteInfo.quorumNumerator.toString()}
                      {...register("quorumNumerator")}
                    />
                  </NumberInput>
                  <InputMessage
                    error={errors.quorumNumerator?.message}
                    message={LL.admin.governance_settings.quorum_numerator_help({
                      current: Number(veVoteInfo.quorumNumerator),
                    })}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.minVotingDelay}>
                  <Label label={LL.admin.governance_settings.min_voting_delay_label()} />
                  <NumberInput min={0}>
                    <NumberInputField
                      placeholder={veVoteInfo.minVotingDelay.toString()}
                      {...register("minVotingDelay")}
                    />
                  </NumberInput>
                  <InputMessage
                    error={errors.minVotingDelay?.message}
                    message={`${LL.admin.governance_settings.min_voting_delay_help()}\nCurrent: ${veVoteInfo.minVotingDelay} (${formatTime(veVoteInfo.minVotingDelay * 10)})`}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.minVotingDuration}>
                  <Label label={LL.admin.governance_settings.min_voting_duration_label()} />
                  <NumberInput min={1}>
                    <NumberInputField
                      placeholder={veVoteInfo.minVotingDuration.toString()}
                      {...register("minVotingDuration")}
                    />
                  </NumberInput>
                  <InputMessage
                    error={errors.minVotingDuration?.message}
                    message={`${LL.admin.governance_settings.min_voting_duration_help()}\nCurrent: ${veVoteInfo.minVotingDuration} (${formatTime(veVoteInfo.minVotingDuration * 10)})`}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.maxVotingDuration}>
                  <Label label={LL.admin.governance_settings.max_voting_duration_label()} />
                  <NumberInput min={1}>
                    <NumberInputField
                      placeholder={veVoteInfo.maxVotingDuration.toString()}
                      {...register("maxVotingDuration")}
                    />
                  </NumberInput>
                  <InputMessage
                    error={errors.maxVotingDuration?.message}
                    message={`${LL.admin.governance_settings.max_voting_duration_help()}\nCurrent: ${veVoteInfo.maxVotingDuration} (${formatTime(veVoteInfo.maxVotingDuration * 10)})`}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.minStakedVetAmount}>
                  <Label label={LL.admin.governance_settings.min_staked_vet_amount_label()} />
                  <NumberInput min={0} step={1000}>
                    <NumberInputField
                      placeholder={Units.formatEther(FixedPointNumber.of(veVoteInfo.minStakedAmount))}
                      {...register("minStakedVetAmount")}
                    />
                  </NumberInput>
                  <InputMessage
                    error={errors.minStakedVetAmount?.message}
                    message={`${LL.admin.governance_settings.min_staked_vet_amount_help()}\nCurrent: ${LL.admin.vet_format({ amount: Units.formatEther(FixedPointNumber.of(veVoteInfo.minStakedAmount)) })}`}
                  />
                </FormControl>
              </SimpleGrid>

              <Box>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={isTransactionPending}
                  loadingText={LL.admin.governance_settings.updating()}
                  isDisabled={!isDirty}>
                  {LL.admin.governance_settings.update_governance_settings()}
                </Button>
              </Box>
              <SensitiveWarning />
            </VStack>
          );
        }}
      </FormSkeleton>
    </AdminCard>
  );
}
