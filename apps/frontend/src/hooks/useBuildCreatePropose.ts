import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { BaseOption, VotingEnum } from "@/types/proposal";
import { useVevoteSendTransaction } from "@/utils/hooks/useVevoteSendTransaction";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import { ethers } from "ethers";
import { useCallback } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useBuildCreateProposal = () => {
  const buildClauses = useCallback(
    ({
      description,
      votingOptions,
      votingType,
      votingLimit,
      startBlock,
      durationBlock,
    }: Omit<ProposalDetails, "description" | "startDate" | "voteDuration"> & {
      description: string;
      startBlock: number;
      durationBlock: number;
    }) => {
      const clauses: EnhancedClause[] = [];

      try {
        const encodedChoices =
          votingType === VotingEnum.SINGLE_CHOICE
            ? votingOptions.map(c => ethers.encodeBytes32String(c as string))
            : votingOptions.map(c => ethers.encodeBytes32String((c as BaseOption).value));

        const createProposalClause: EnhancedClause = {
          to: contractAddress,
          value: 0,
          data: contractInterface.encodeFunctionData("propose", [
            description,
            startBlock,
            durationBlock - startBlock,
            encodedChoices,
            votingLimit || 1,
            1,
          ]),
          comment: `Create new proposal`,
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("propose"))),
        };

        //TODO: use sdk once vechain-kit is compatible
        /* ---------- with sdk
        const interfaceJson = contractInterface.getFunction("propose")?.format("full");
        if (!interfaceJson) throw new Error(`Method propose not found`);

        const functionAbi = new ABIFunction(interfaceJson);

        const createProposalClause = Clause.callFunction(
          Address.of(contractAddress),
          functionAbi,
          encodedData,
        ) as EnhancedClause;

        --------- with sdk */

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
  });
};
