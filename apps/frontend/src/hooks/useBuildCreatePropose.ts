import { ProposalDetails } from "@/pages/CreateProposal/CreateProposalProvider";
import { BaseOption, VotingEnum } from "@/types/proposal";
import { useBuildTransaction } from "@/utils";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { EnhancedClause } from "@vechain/vechain-kit";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { useCallback } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useBuildCreateProposal = () => {
  const buildClauses = useCallback(
    ({
      description,
      startDate,
      endDate,
      votingOptions,
      votingType,
      votingLimit,
    }: Omit<ProposalDetails, "description"> & { description: string }) => {
      const clauses: EnhancedClause[] = [];

      try {
        const encodedChoices =
          votingType === VotingEnum.SINGLE_CHOICE
            ? votingOptions.map(c => ethers.encodeBytes32String(c as string))
            : votingOptions.map(c => ethers.encodeBytes32String((c as BaseOption).value));

        const encodedData = [
          description,
          dayjs(startDate).unix(),
          dayjs(endDate).unix() - dayjs(startDate).unix(),
          encodedChoices,
          votingLimit || 1,
          1,
        ];

        const createProposalClause: EnhancedClause = {
          to: contractAddress,
          value: 0,
          data: contractInterface.encodeFunctionData("propose", encodedData),
          comment: `Create new proposal`,
          abi: JSON.parse(JSON.stringify(contractInterface.getFunction("propose"))),
        };

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

  //TODO refetch proposals

  //   const refetchQueryKeys = useMemo(() => {
  //     return [
  //       ['proposalsEvents'],
  //       getProposalUserDepositQueryKey("allClaimableDeposits", account?.address ?? ""),
  //     ];
  //   }, [account?.address]);

  return useBuildTransaction({
    clauseBuilder: buildClauses,
  });
};
