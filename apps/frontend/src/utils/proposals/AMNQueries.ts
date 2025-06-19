import { Interface } from "ethers";
import { executeCall } from "../contract";
import { AMN_ABI, AMN_ADDRESS } from "../authority-master-node/abi";

export const getMasterNode = async (address: string) => {
  try {
    const result = await executeCall({
      contractAddress: AMN_ADDRESS,
      contractInterface: new Interface(AMN_ABI.abi),
      method: "get",
      args: [address],
    });

    if (!result.success) return false;
    return result.result.plain;
  } catch (error) {
    return false;
  }
};
