import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useCallback, useMemo } from "react";
import { useBuildTransaction } from "../utils";
import { buildClause } from "../utils/buildClause";
import { getVeVoteBalanceQueryKey } from "./useVeVoteBalance";
import { useWallet } from "@vechain/dapp-kit-react";
import { ethers } from "ethers";

const GovernorInterface = VeVote__factory.createInterface();

type Props = { onSuccess?: () => void };

type useMintVeVoteParams = {
  amount: string;
  receiver: string;
};

export const useMintVeVote = ({ onSuccess }: Props) => {
  const { account } = useWallet();

  const clauseBuilder = useCallback(
    ({ amount, receiver }: useMintVeVoteParams) => {
      const contractAmount = ethers.parseEther(amount);
      return [
        buildClause({
          to: getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress,
          contractInterface: GovernorInterface,
          method: "mint",
          args: [receiver, contractAmount],
          comment: "mint vevote",
        }),
      ];
    },
    []
  );

  const refetchQueryKeys = useMemo(
    () => [getVeVoteBalanceQueryKey(account || "")],
    [account]
  );

  return useBuildTransaction({
    clauseBuilder,
    refetchQueryKeys,
    onSuccess,
  });
};
