import { Interface } from "ethers";
import { executeCall } from "../contract";
import { AMN_ABI, AMN_ADDRESS } from "../authority-master-node/abi";
import { MasterNodeResponse } from "@/types/AMN";

export const getMasterNode = async (address: string) => {
  try {
    const result = await executeCall({
      contractAddress: AMN_ADDRESS,
      contractInterface: new Interface(AMN_ABI.abi),
      method: "get",
      args: [address],
    });

    if (!result.success) return false;
    return {
      listed: result.result.array?.[0] || false,
      endorsor: result.result.array?.[1] || "",
      identity: result.result.array?.[2] || "",
      active: result.result.array?.[3] || false,
    } as MasterNodeResponse;
  } catch (error) {
    return undefined;
  }
};
