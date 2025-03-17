import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { getCallKey, useCall } from "../utils/hooks/useCall";
import { ethers } from "ethers";
import { useWallet } from "@vechain/vechain-kit";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();
const method = "balanceOf";

export const getVeVoteBalanceQueryKey = (address: string) => getCallKey({ method, keyArgs: [address] });

export const useVeVoteBalance = () => {
  const { account } = useWallet();
  const results = useCall({
    contractInterface,
    contractAddress,
    method,
    args: [account?.address],
  });

  return {
    ...results,
    balance: Number(ethers.formatEther(results.data || 0)),
    isBalanceLoading: results.isPending,
  };
};
