import { Box, Button, FormControl, Input, Text, VStack, HStack, Divider } from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { AdminCard } from "../common/AdminCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { useVotingPowerAtTimepoint, VotingPowerAtTimepointResult } from "../../hooks/useVotingPowerAtTimepoint";
import { useVechainDomainOrAddress } from "@/hooks/useVechainDomainOrAddress";
import { CopyLink } from "@/components/ui/CopyLink";
import { getConfig } from "@repo/config";
import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { Label } from "@/components/ui/Label";
import { InputMessage } from "@/components/ui/InputMessage";
import { votingPowerQuerySchema, VotingPowerQuerySchema } from "@/schema/adminSchema";
import { formatAddress } from "@/utils/address";
import { formatVotingPower } from "@/utils/proposals/helpers";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

export function VotingPowerAtTimepointCard() {
  const { LL } = useI18nContext();

  const [queryParams, setQueryParams] = useState<{
    address?: string;
    timepoint?: number;
    masterAddress?: string;
  }>({ address: undefined, timepoint: undefined, masterAddress: undefined });

  const defaultValues = useMemo(
    () => ({
      address: "",
      timepoint: undefined,
      masterAddress: "",
    }),
    [],
  );

  const onSubmit = useCallback(async (values: VotingPowerQuerySchema) => {
    setQueryParams({
      address: values.address,
      timepoint: values.timepoint,
      masterAddress: values.masterAddress || undefined,
    });
  }, []);

  const { data: votingPowerData, isLoading, error } = useVotingPowerAtTimepoint(queryParams);

  return (
    <AdminCard title={LL.admin.voting_power_timepoint.title()}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="sm" color="gray.600">
          {LL.admin.voting_power_timepoint.help_text()}
        </Text>

        <FormSkeleton schema={votingPowerQuerySchema} defaultValues={defaultValues} onSubmit={onSubmit}>
          {({ register, errors }) => (
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.address}>
                <Label label={LL.admin.voting_power_timepoint.address_label()} />
                <Input
                  placeholder={LL.admin.voting_power_timepoint.address_placeholder()}
                  size="md"
                  {...register("address")}
                />
                <InputMessage error={errors.address?.message} />
              </FormControl>

              <FormControl isInvalid={!!errors.timepoint}>
                <Label label={LL.admin.voting_power_timepoint.timepoint_label()} />
                <Input
                  placeholder={LL.admin.voting_power_timepoint.timepoint_placeholder()}
                  type="number"
                  size="md"
                  {...register("timepoint")}
                />
                <InputMessage error={errors.timepoint?.message} />
              </FormControl>

              <FormControl isInvalid={!!errors.masterAddress}>
                <Label label={LL.admin.voting_power_timepoint.master_address_label()} isOptional />
                <Input
                  placeholder={LL.admin.voting_power_timepoint.master_address_placeholder()}
                  size="md"
                  {...register("masterAddress")}
                />
                <InputMessage error={errors.masterAddress?.message} />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText={LL.admin.voting_power_timepoint.querying()}
                width="full">
                {LL.admin.voting_power_timepoint.query_button()}
              </Button>
            </VStack>
          )}
        </FormSkeleton>
        <QueryResults queryParams={queryParams} error={error} votingPowerData={votingPowerData} isLoading={isLoading} />
      </VStack>
    </AdminCard>
  );
}

const QueryResults = ({
  queryParams,
  error,
  votingPowerData,
  isLoading,
}: {
  queryParams: { address?: string; timepoint?: number; masterAddress?: string };
  error: Error | null;
  votingPowerData?: VotingPowerAtTimepointResult;
  isLoading: boolean;
}) => {
  const { LL } = useI18nContext();

  const { addressOrDomain } = useVechainDomainOrAddress(queryParams.address);

  const hasQueried = useMemo(() => Boolean(queryParams.address && queryParams.timepoint !== undefined), [queryParams]);

  if (!hasQueried) return null;
  return (
    <>
      <Divider />

      {error && (
        <GenericInfoBox variant="error">
          <Text color="red.700">
            {LL.admin.voting_power_timepoint.error_description({
              error: error instanceof Error ? error.message : LL.admin.unknown_error(),
            })}
          </Text>
        </GenericInfoBox>
      )}

      {!error && votingPowerData && (
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {LL.admin.voting_power_timepoint.results_title()}
          </Text>

          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="medium">{LL.admin.voting_power_timepoint.address()}</Text>
              <CopyLink
                href={`${EXPLORER_URL}/accounts/${queryParams.address}`}
                isExternal
                textToCopy={queryParams.address}
                color="primary.700"
                fontWeight={500}>
                {addressOrDomain}
              </CopyLink>
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="medium">{LL.admin.voting_power_timepoint.timepoint()}</Text>
              <Text>{queryParams.timepoint?.toString()}</Text>
            </HStack>

            {queryParams.masterAddress && (
              <HStack justify="space-between">
                <Text fontWeight="medium">{LL.admin.voting_power_timepoint.master_address()}</Text>
                <CopyLink
                  href={`${EXPLORER_URL}/accounts/${queryParams.masterAddress}`}
                  isExternal
                  textToCopy={queryParams.masterAddress}
                  color="primary.700"
                  fontWeight={500}>
                  {formatAddress(queryParams.masterAddress)}
                </CopyLink>
              </HStack>
            )}

            <Divider />

            <HStack justify="space-between">
              <Text fontWeight="medium" color="blue.600">
                {LL.admin.voting_power_timepoint.node_power_label()}
              </Text>
              <Text fontWeight="bold">{formatVotingPower(votingPowerData.nodePower)}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="medium" color="green.600">
                {LL.admin.voting_power_timepoint.validator_power_label()}
              </Text>
              <Text fontWeight="bold">{formatVotingPower(votingPowerData.validatorPower)}</Text>
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="lg" color="purple.600">
                {LL.admin.voting_power_timepoint.total_power_label()}
              </Text>
              <Text fontWeight="bold" fontSize="lg">
                {formatVotingPower(votingPowerData.totalPower)}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}

      {!error && !votingPowerData && !isLoading && (
        <GenericInfoBox variant="info">
          <Text>{LL.admin.voting_power_timepoint.no_results()}</Text>
        </GenericInfoBox>
      )}
    </>
  );
};
