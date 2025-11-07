import { FormSkeleton } from "@/components/ui/FormSkeleton";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { DataTable } from "@/components/ui/TableSkeleton";
import { useLevelMultipliers } from "@/hooks/useLevelMultipliers";
import { useI18nContext } from "@/i18n/i18n-react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { useLevelMultipliersInfo } from "../../hooks/useLevelMultipliersInfo";
import { AdminCard } from "../common/AdminCard";
import { BaseCell, MultiplierInputCell, TableHeader } from "../common/AdminTableCells";
import { SensitiveWarning } from "../common/SensitiveWarning";

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

interface LevelMultiplierRow {
  id: number;
  name: string;
  currentMultiplier: number;
}

const columnHelper = createColumnHelper<LevelMultiplierRow>();

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
      { id: 0, name: LL.admin.governance_settings.validator_multiplier() },
      { id: 1, name: LL.admin.governance_settings.strength() },
      { id: 2, name: LL.admin.governance_settings.thunder() },
      { id: 3, name: LL.admin.governance_settings.mjolnir() },
      { id: 4, name: LL.admin.governance_settings.vethor_x() },
      { id: 5, name: LL.admin.governance_settings.strength_x() },
      { id: 6, name: LL.admin.governance_settings.thunder_x() },
      { id: 7, name: LL.admin.governance_settings.mjolnir_x() },
      { id: 8, name: LL.admin.governance_settings.dawn() },
      { id: 9, name: LL.admin.governance_settings.lightning() },
      { id: 10, name: LL.admin.governance_settings.flash() },
    ],
    [LL.admin.governance_settings],
  );

  const getCurrentMultiplier = useCallback(
    (index: number) => {
      return currentMultipliers?.[index] ?? getDefaultMultiplierForLevel(index);
    },
    [currentMultipliers],
  );

  const tableData: LevelMultiplierRow[] = useMemo(
    () =>
      levelData.map(level => ({
        ...level,
        currentMultiplier: getCurrentMultiplier(level.id),
      })),
    [levelData, getCurrentMultiplier],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        cell: data => <BaseCell value={data.getValue()} />,
        header: () => <TableHeader label={LL.admin.governance_settings.node_name()} />,
        id: "NODE_NAME",
        size: 200,
      }),
      columnHelper.accessor("currentMultiplier", {
        cell: data => <BaseCell value={data.getValue().toString()} />,
        header: () => <TableHeader label={LL.admin.governance_settings.current_multiplier()} />,
        id: "CURRENT_MULTIPLIER",
        size: 140,
      }),
      columnHelper.accessor("id", {
        cell: data => (
          <MultiplierInputCell
            fieldName={`multiplier${data.getValue()}`}
            placeholder={data.row.original.currentMultiplier.toString()}
          />
        ),
        header: () => <TableHeader label={LL.admin.governance_settings.new_multiplier()} />,
        id: "NEW_MULTIPLIER",
        size: 120,
      }),
    ],
    [LL.admin.governance_settings],
  );

  if (isLoadingMultipliers) {
    return (
      <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={"full"}>
        <Text>{LL.admin.vevote_contract.loading()}</Text>
      </AdminCard>
    );
  }

  if (multipliersError) {
    return (
      <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={"full"}>
        <GenericInfoBox variant="error">
          <Text color="red.700">Error loading multipliers</Text>
        </GenericInfoBox>
      </AdminCard>
    );
  }

  return (
    <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={"full"}>
      <Text fontSize="sm" color="gray.600" mb={4}>
        {LL.admin.governance_settings.level_multipliers_help()}
      </Text>

      <FormSkeleton schema={multiplierSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
        {({ watch }) => {
          const watchedValues = watch();
          const hasChanges = Object.values(watchedValues).some(
            value => value !== undefined && value !== null && value !== "",
          );

          return (
            <Flex direction="column" width="100%">
              <DataTable columns={columns} data={tableData} />
              <Button
                mt={6}
                type="submit"
                isLoading={isTransactionPending}
                loadingText={LL.admin.governance_settings.updating()}
                isDisabled={!hasChanges}>
                {LL.admin.governance_settings.update_multipliers()}
              </Button>
            </Flex>
          );
        }}
      </FormSkeleton>
      <SensitiveWarning />
    </AdminCard>
  );
}
