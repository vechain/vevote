import { ABIContract } from "@vechain/sdk-core";

export const AMN_ABI = ABIContract.ofAbi([
  {
    constant: true,
    inputs: [
      {
        name: "_nodeMaster",
        type: "address",
      },
    ],
    name: "get",
    outputs: [
      {
        name: "listed",
        type: "bool",
      },
      {
        name: "endorsor",
        type: "address",
      },
      {
        name: "identity",
        type: "bytes32",
      },
      {
        name: "active",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]);

export const AMN_ADDRESS = "0x0000000000000000000000417574686f72697479";
