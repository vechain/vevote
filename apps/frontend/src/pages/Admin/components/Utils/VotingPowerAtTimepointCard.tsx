import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Divider,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { AdminCard } from "../common/AdminCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { useVotingPowerAtTimepoint } from "../../hooks/useVotingPowerAtTimepoint";
import { useVechainDomainOrAddress } from "@/hooks/useVechainDomainOrAddress";
import { CopyLink } from "@/components/ui/CopyLink";
import { getConfig } from "@repo/config";

const EXPLORER_URL = getConfig(import.meta.env.VITE_APP_ENV).network.explorerUrl;

interface FormData {
  address: string;
  timepoint: string;
  masterAddress: string;
}

interface FormErrors {
  address?: string;
  timepoint?: string;
  masterAddress?: string;
}

export function VotingPowerAtTimepointCard() {
  const { LL } = useI18nContext();

  const [formData, setFormData] = useState<FormData>({
    address: "",
    timepoint: "",
    masterAddress: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasQueried, setHasQueried] = useState(false);

  const queryParams = useMemo(() => {
    if (!hasQueried || !formData.address || !formData.timepoint) {
      return { address: undefined, timepoint: undefined, masterAddress: undefined };
    }

    return {
      address: formData.address.trim(),
      timepoint: parseInt(formData.timepoint),
      masterAddress: formData.masterAddress.trim() || undefined,
    };
  }, [hasQueried, formData]);

  const { data: votingPowerData, isLoading, error } = useVotingPowerAtTimepoint(queryParams);
  const { addressOrDomain } = useVechainDomainOrAddress(queryParams.address);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = LL.admin.voting_power_timepoint.address_required();
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address.trim())) {
      newErrors.address = LL.admin.voting_power_timepoint.invalid_address();
    }

    if (!formData.timepoint.trim()) {
      newErrors.timepoint = LL.admin.voting_power_timepoint.timepoint_required();
    } else if (isNaN(parseInt(formData.timepoint)) || parseInt(formData.timepoint) < 0) {
      newErrors.timepoint = LL.admin.voting_power_timepoint.invalid_timepoint();
    }

    if (formData.masterAddress.trim() && !/^0x[a-fA-F0-9]{40}$/.test(formData.masterAddress.trim())) {
      newErrors.masterAddress = LL.admin.voting_power_timepoint.invalid_address();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, LL.admin.voting_power_timepoint]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleQuery = useCallback(() => {
    if (validateForm()) {
      setHasQueried(true);
    }
  }, [validateForm]);

  const formatVotingPower = useCallback((power: bigint): string => {
    return (Number(power) / 100).toLocaleString();
  }, []);

  return (
    <AdminCard title={LL.admin.voting_power_timepoint.title()} maxW={800}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="sm" color="gray.600">
          {LL.admin.voting_power_timepoint.help_text()}
        </Text>

        <Box>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.address}>
              <FormLabel>{LL.admin.voting_power_timepoint.address_label()}</FormLabel>
              <Input
                value={formData.address}
                onChange={e => handleInputChange("address", e.target.value)}
                placeholder={LL.admin.voting_power_timepoint.address_placeholder()}
                size="md"
              />
              <FormErrorMessage>{errors.address}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.timepoint}>
              <FormLabel>{LL.admin.voting_power_timepoint.timepoint_label()}</FormLabel>
              <Input
                value={formData.timepoint}
                onChange={e => handleInputChange("timepoint", e.target.value)}
                placeholder={LL.admin.voting_power_timepoint.timepoint_placeholder()}
                type="number"
                size="md"
              />
              <FormErrorMessage>{errors.timepoint}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.masterAddress}>
              <FormLabel>{LL.admin.voting_power_timepoint.master_address_label()}</FormLabel>
              <Input
                value={formData.masterAddress}
                onChange={e => handleInputChange("masterAddress", e.target.value)}
                placeholder={LL.admin.voting_power_timepoint.master_address_placeholder()}
                size="md"
              />
              <FormErrorMessage>{errors.masterAddress}</FormErrorMessage>
            </FormControl>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleQuery}
              isLoading={isLoading}
              loadingText={LL.admin.voting_power_timepoint.querying()}
              width="full">
              {LL.admin.voting_power_timepoint.query_button()}
            </Button>
          </VStack>
        </Box>

        {hasQueried && (
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
                    <Text fontWeight="medium">Address:</Text>
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
                    <Text fontWeight="medium">Timepoint:</Text>
                    <Text>{queryParams.timepoint?.toLocaleString()}</Text>
                  </HStack>

                  {queryParams.masterAddress && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Master Address:</Text>
                      <CopyLink
                        href={`${EXPLORER_URL}/accounts/${queryParams.masterAddress}`}
                        isExternal
                        textToCopy={queryParams.masterAddress}
                        color="primary.700"
                        fontWeight={500}>
                        {queryParams.masterAddress.slice(0, 6)}...{queryParams.masterAddress.slice(-4)}
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
        )}
      </VStack>
    </AdminCard>
  );
}
