import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { executeCall } from "../contract";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const getQuorumPercentage = async () => {
  const res = await executeCall({
    contractAddress,
    contractInterface,
    method: "quorumNumerator()",
    args: [],
  });

  if (!res.success) {
    throw new Error("Failed to fetch quorum percentage");
  }
  return Number(res.result.plain);
};
