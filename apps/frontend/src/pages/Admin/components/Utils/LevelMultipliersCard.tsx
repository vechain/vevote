import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Button,
  Box,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useLevelMultipliers } from "@/hooks/useLevelMultipliers";
import { AdminCard } from "../common/AdminCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { useLevelMultipliersInfo } from "../../hooks/useLevelMultipliersInfo";
import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { z } from "zod";

interface LevelMultipliersCardProps {
  onSuccess?: () => void;
}

const getDefaultMultiplierForLevel = (levelId: number): number => {
  const defaults = [200, 100, 100, 100, 150, 150, 150, 150, 100, 100, 100];
  return defaults[levelId] || 100;
};

const multiplierSchema = z.object({
  multiplier0: z.coerce.number().min(0).max(1000).optional(),
  multiplier1: z.coerce.number().min(0).max(1000).optional(),
  multiplier2: z.coerce.number().min(0).max(1000).optional(),
  multiplier3: z.coerce.number().min(0).max(1000).optional(),
  multiplier4: z.coerce.number().min(0).max(1000).optional(),
  multiplier5: z.coerce.number().min(0).max(1000).optional(),
  multiplier6: z.coerce.number().min(0).max(1000).optional(),
  multiplier7: z.coerce.number().min(0).max(1000).optional(),
  multiplier8: z.coerce.number().min(0).max(1000).optional(),
  multiplier9: z.coerce.number().min(0).max(1000).optional(),
  multiplier10: z.coerce.number().min(0).max(1000).optional(),
});

type MultiplierSchema = z.infer<typeof multiplierSchema>;

export function LevelMultipliersCard({ onSuccess }: LevelMultipliersCardProps) {
  const { LL } = useI18nContext();
  const { sendTransaction, isTransactionPending } = useLevelMultipliers();
  const {
    data: currentMultipliers,
    isLoading: isLoadingMultipliers,
    error: multipliersError,
  } = useLevelMultipliersInfo();

  const defaultValues = useMemo(
    () => ({
      multiplier0: undefined,
      multiplier1: undefined,
      multiplier2: undefined,
      multiplier3: undefined,
      multiplier4: undefined,
      multiplier5: undefined,
      multiplier6: undefined,
      multiplier7: undefined,
      multiplier8: undefined,
      multiplier9: undefined,
      multiplier10: undefined,
    }),
    [],
  );

  const onSubmit = useCallback(
    async (values: MultiplierSchema) => {
      const multipliers = Array.from({ length: 11 }, (_, index) => {
        const fieldKey = `multiplier${index}` as keyof MultiplierSchema;
        const formValue = values[fieldKey];

        return formValue !== undefined
          ? formValue
          : (currentMultipliers?.[index] ?? getDefaultMultiplierForLevel(index));
      });

      await sendTransaction({
        updateLevelIdMultipliers: multipliers,
      });

      onSuccess?.();
    },
    [currentMultipliers, sendTransaction, onSuccess],
  );

  const levelData = useMemo(
    () => [
      { id: 1, name: LL.admin.governance_settings.strength_node_multiplier(), type: "regular" },
      { id: 2, name: LL.admin.governance_settings.thunder_node_multiplier(), type: "regular" },
      { id: 3, name: LL.admin.governance_settings.mjolnir_node_multiplier(), type: "regular" },
      { id: 4, name: LL.admin.governance_settings.vethor_x_node_multiplier(), type: "x-node" },
      { id: 5, name: LL.admin.governance_settings.strength_x_node_multiplier(), type: "x-node" },
      { id: 6, name: LL.admin.governance_settings.thunder_x_node_multiplier(), type: "x-node" },
      { id: 7, name: LL.admin.governance_settings.mjolnir_x_node_multiplier(), type: "x-node" },
      { id: 8, name: LL.admin.governance_settings.dawn_node_multiplier(), type: "regular" },
      { id: 9, name: LL.admin.governance_settings.lightning_node_multiplier(), type: "regular" },
      { id: 10, name: LL.admin.governance_settings.flash_node_multiplier(), type: "regular" },
    ],
    [LL.admin.governance_settings],
  );

  const getCurrentMultiplier = useCallback(
    (index: number) => {
      return currentMultipliers?.[index] ?? getDefaultMultiplierForLevel(index);
    },
    [currentMultipliers],
  );

  if (isLoadingMultipliers) {
    return (
      <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={850}>
        <Text>{LL.admin.vevote_contract.loading()}</Text>
      </AdminCard>
    );
  }

  if (multipliersError) {
    return (
      <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={850}>
        <GenericInfoBox variant="error">
          <Text color="red.700">Error loading multipliers</Text>
        </GenericInfoBox>
      </AdminCard>
    );
  }

  return (
    <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={850}>
      <Text fontSize="sm" color="gray.600" mb={4}>
        {LL.admin.governance_settings.level_multipliers_help()}
      </Text>

      <FormSkeleton schema={multiplierSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
        {({ register, errors, watch }) => {
          const watchedValues = watch();
          const hasChanges = Object.values(watchedValues).some(
            value => value !== undefined && value !== null && value !== "",
          );

          return (
            <>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>{LL.admin.governance_settings.node_type()}</Th>
                      <Th>{LL.admin.governance_settings.current_multiplier()}</Th>
                      <Th>{LL.admin.governance_settings.new_multiplier()}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {levelData.map(({ id, name, type }) => (
                      <Tr key={id} bg={type === "x-node" ? "green.50" : undefined}>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {name}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {getCurrentMultiplier(id)}
                          </Text>
                        </Td>
                        <Td>
                          <FormControl isInvalid={!!errors[`multiplier${id}` as keyof MultiplierSchema]}>
                            <Input
                              type="number"
                              placeholder={getCurrentMultiplier(id).toString()}
                              min={0}
                              max={1000}
                              step={10}
                              size="sm"
                              width="100px"
                              {...register(`multiplier${id}` as keyof MultiplierSchema)}
                            />
                          </FormControl>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Box mt={6}>
                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  isLoading={isTransactionPending}
                  loadingText={LL.admin.governance_settings.updating()}
                  isDisabled={!hasChanges}>
                  {LL.admin.governance_settings.update_multipliers()}
                </Button>
              </Box>
            </>
          );
        }}
      </FormSkeleton>
    </AdminCard>
  );
}
