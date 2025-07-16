import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { fromStringToUint256 } from "@/utils/proposals/helpers";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { ABIFunction, Address, Clause } from "@vechain/sdk-core";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useCallback } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useExecuteProposal = ({ proposalId }: { proposalId?: string }) => {
  const buildClauses = useCallback(({ proposalId, link }: { proposalId: string; link: string }) => {
    const clauses: EnhancedClause[] = [];

    try {
      const encodedData = [fromStringToUint256(proposalId), link];

      const interfaceJson = contractInterface.getFunction("executeWithComment")?.format("full");
      if (!interfaceJson) throw new Error(`Method executeWithComment not found`);

      const functionAbi = new ABIFunction(interfaceJson);

      const clause = Clause.callFunction(Address.of(contractAddress), functionAbi, encodedData);

      clauses.push(clause);

      return clauses;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    refetchQueryKeys: [["getSingleProposal", proposalId]],
  });
};
