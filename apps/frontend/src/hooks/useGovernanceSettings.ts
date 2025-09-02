import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { useCallback } from "react";

type GovernanceSettingsProps = {
  updateQuorumNumerator?: number;
  setMinVotingDelay?: number;
  setMinVotingDuration?: number;
  setMaxVotingDuration?: number;
};

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useGovernanceSettings = () => {
  const buildClauses = useCallback((props: GovernanceSettingsProps) => {
    const clauses: EnhancedClause[] = [];

    try {
      const baseClause = {
        to: contractAddress,
        value: 0,
      };

      if (props.updateQuorumNumerator !== undefined) {
        const clause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("updateQuorumNumerator", [props.updateQuorumNumerator]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("updateQuorumNumerator"))),
          comment: `Update quorum numerator to ${props.updateQuorumNumerator}`,
        };
        clauses.push(clause as EnhancedClause);
      }

      if (props.setMinVotingDelay !== undefined) {
        const blocksValue = Math.floor(props.setMinVotingDelay / 10);
        const clause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("setMinVotingDelay", [blocksValue]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("setMinVotingDelay"))),
          comment: `Set min voting delay to ${props.setMinVotingDelay} seconds (${blocksValue} blocks)`,
        };
        clauses.push(clause as EnhancedClause);
      }

      if (props.setMinVotingDuration !== undefined) {
        const blocksValue = Math.floor(props.setMinVotingDuration / 10);
        const clause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("setMinVotingDuration", [blocksValue]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("setMinVotingDuration"))),
          comment: `Set min voting duration to ${props.setMinVotingDuration} seconds (${blocksValue} blocks)`,
        };
        clauses.push(clause as EnhancedClause);
      }

      if (props.setMaxVotingDuration !== undefined) {
        const blocksValue = Math.floor(props.setMaxVotingDuration / 10);
        const clause = {
          ...baseClause,
          data: contractInterface.encodeFunctionData("setMaxVotingDuration", [blocksValue]),
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("setMaxVotingDuration"))),
          comment: `Set max voting duration to ${props.setMaxVotingDuration} seconds (${blocksValue} blocks)`,
        };
        clauses.push(clause as EnhancedClause);
      }

      return clauses;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    delayedRefetchKeys: [["veVoteInfo"]],
    refetchDelay: 500,
    maxRetries: 1,
  });
};
