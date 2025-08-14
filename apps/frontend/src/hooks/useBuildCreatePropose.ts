import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { ABIFunction, Address, Clause } from "@vechain/sdk-core";
import { EnhancedClause } from "@vechain/vechain-kit";
import { useCallback } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useBuildCreateProposal = () => {
  const buildClauses = useCallback(
    ({
      description,
      startBlock,
      durationBlock,
    }: Omit<ProposalDetails, "description" | "startDate" | "voteDuration"> & {
      description: string;
      startBlock: number;
      durationBlock: number;
    }) => {
      const clauses: EnhancedClause[] = [];

      try {
        const encodedData = [description, startBlock, durationBlock - startBlock];

        const interfaceJson = contractInterface.getFunction("propose")?.format("full");
        if (!interfaceJson) throw new Error(`Method propose not found`);

        const functionAbi = new ABIFunction(interfaceJson);

        const createProposalClause = Clause.callFunction(
          Address.of(contractAddress),
          functionAbi,
          encodedData,
        ) as EnhancedClause;

        clauses.push(createProposalClause);

        return clauses;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [],
  );

  return useVevoteSendTransaction({
    clauseBuilder: buildClauses,
    refetchQueryKeys: [["proposalEvent"], ["infiniteProposals"]],
    delayedRefetchKeys: [["proposalEvent"]],
  });
};
