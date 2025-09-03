import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Button,
  Box,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useLevelMultipliers } from "@/hooks/useLevelMultipliers";
import { AdminCard } from "../common/AdminCard";
import { GenericInfoBox } from "@/components/ui/GenericInfoBox";
import { useLevelMultipliersInfo } from "../../hooks/useLevelMultipliersInfo";

interface LevelMultipliersCardProps {
  onSuccess?: () => void;
}

const getDefaultMultiplierForLevel = (levelId: number): number => {
  const defaults = [200, 100, 100, 100, 150, 150, 150, 150, 100, 100, 100];
  return defaults[levelId] || 100;
};

export function LevelMultipliersCard({ onSuccess }: LevelMultipliersCardProps) {
  const { LL } = useI18nContext();
  const { sendTransaction, isTransactionPending } = useLevelMultipliers();
  const {
    data: currentMultipliers,
    isLoading: isLoadingMultipliers,
    error: multipliersError,
  } = useLevelMultipliersInfo();

  const [levelMultipliers, setLevelMultipliers] = useState<string[]>(Array(11).fill(""));
  const [errorMessage, setErrorMessage] = useState<string>("");

  const hasChanges = useMemo(() => 
    levelMultipliers.some(val => val !== ""), 
    [levelMultipliers]
  );

  const handleMultiplierChange = (index: number, value: string) => {
    setLevelMultipliers(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  const handleSubmit = useCallback(async () => {
    try {
      setErrorMessage("");

      if (!hasChanges) return;

      const multipliers = levelMultipliers.map((val, index) =>
        val !== "" ? Number(val) : (currentMultipliers?.[index] ?? getDefaultMultiplierForLevel(index)),
      );

      await sendTransaction({
        updateLevelIdMultipliers: multipliers,
      });
      onSuccess?.();

      setLevelMultipliers(Array(11).fill(""));
    } catch (err) {
      const error = err as { error?: { message: string }; message: string };
      setErrorMessage(
        error?.error?.message ||
          error?.message ||
          LL.admin.governance_settings.error_description({ error: LL.admin.unknown_error() }),
      );
    }
  }, [hasChanges, levelMultipliers, sendTransaction, onSuccess, currentMultipliers, LL.admin]);

  const levelData = useMemo(() => [
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
  ], [LL.admin.governance_settings]);

  const getCurrentMultiplier = useCallback((index: number) => {
    return currentMultipliers?.[index] ?? getDefaultMultiplierForLevel(index);
  }, [currentMultipliers]);

  if (isLoadingMultipliers) {
    return (
      <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={800}>
        <Text>{LL.admin.vevote_contract.loading()}</Text>
      </AdminCard>
    );
  }

  if (multipliersError) {
    return (
      <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={800}>
        <GenericInfoBox variant="error">
          <Text color="red.700">Error loading multipliers</Text>
        </GenericInfoBox>
      </AdminCard>
    );
  }

  return (
    <AdminCard title={LL.admin.governance_settings.level_multipliers_label()} maxW={800}>
      <Text fontSize="sm" color="gray.600" mb={4}>
        {LL.admin.governance_settings.level_multipliers_help()}
      </Text>

      {errorMessage && (
        <GenericInfoBox variant="error" mb={4}>
          <Text color="red.700">{errorMessage}</Text>
        </GenericInfoBox>
      )}

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
                  <NumberInput
                    value={levelMultipliers[id]}
                    onChange={value => handleMultiplierChange(id, value)}
                    min={0}
                    max={1000}
                    step={10}
                    size="sm"
                    width="100px">
                    <NumberInputField placeholder={getCurrentMultiplier(id).toString()} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Box mt={6}>
        <Button
          colorScheme="green"
          size="lg"
          onClick={handleSubmit}
          isLoading={isTransactionPending}
          loadingText={LL.admin.governance_settings.updating()}
          isDisabled={!hasChanges}>
          {LL.admin.governance_settings.update_multipliers()}
        </Button>
      </Box>
    </AdminCard>
  );
}
