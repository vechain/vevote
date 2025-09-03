import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { useCallback } from "react";

type LevelMultipliersProps = {
  updateLevelIdMultipliers: number[];
};

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useLevelMultipliers = () => {
  const buildClauses = useCallback((props: LevelMultipliersProps) => {
    const clauses: EnhancedClause[] = [];

    try {
      const baseClause = {
        to: contractAddress,
        value: 0,
      };

      const clause = {
        ...baseClause,
        data: contractInterface.encodeFunctionData("updateLevelIdMultipliers", [props.updateLevelIdMultipliers]),
        abi: JSON.parse(JSON.stringify(contractInterface.getFunction("updateLevelIdMultipliers"))),
        comment: `Update level ID multipliers: [${props.updateLevelIdMultipliers.join(', ')}]`,
      };
      clauses.push(clause as EnhancedClause);

      return clauses;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    delayedRefetchKeys: [["veVoteInfo"], ["levelMultipliers"]],
    refetchDelay: 500,
    maxRetries: 1,
  });
};