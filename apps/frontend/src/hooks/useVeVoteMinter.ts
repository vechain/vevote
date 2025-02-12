import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { getCallKey, useCall } from "../utils/hooks/useCall";
import { useWallet } from "@vechain/dapp-kit-react";
import { compareAddresses } from "@repo/utils/AddressUtils";

const contractAddress = getConfig(
  import.meta.env.VITE_APP_ENV
).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();
const method = "owner";

export const getVeVoteMinterQueryKey = () => {
  getCallKey({ method });
};

export const useVeVoteMinter = () => {
  const { account } = useWallet();
  const results = useCall({
    contractInterface,
    contractAddress,
    method,
  });

  return {
    ...results,
    minter: results.data,
    isMinter: compareAddresses(results.data || "", account || ""),
    isMinterLoading: results.isPending,
  };
};
