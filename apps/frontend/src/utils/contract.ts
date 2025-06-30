import { MethodName } from "@/types/common";
import { Interface } from "ethers";
import { ABIFunction } from "@vechain/sdk-core";
import { thorClient } from "./thorClient";
import { ContractCallOptions, SimulateTransactionOptions } from "@vechain/sdk-network";

export const executeMultipleClauses = async <T extends Interface>({
  contractAddress,
  contractInterface,
  methodsWithArgs,
  callOptions,
}: {
  contractAddress: string;
  contractInterface: T;
  methodsWithArgs?: { method: MethodName<T["getFunction"]>; args: unknown[] }[];
  callOptions?: SimulateTransactionOptions;
}) => {
  try {
    const clauses = methodsWithArgs?.map(({ method, args }) => {
      const interfaceJson = contractInterface.getFunction(method)?.format("full");
      if (!interfaceJson) throw new Error(`Method ${method} not found`);

      const functionAbi = new ABIFunction(interfaceJson);
      return thorClient.contracts.load(contractAddress, [functionAbi.signature]).clause[method](...args);
    });

    if (!clauses) throw new Error(`Clauses not found`);

    const results = await thorClient.contracts.executeMultipleClausesCall(clauses, callOptions);

    return results;
  } catch (error) {
    console.error("Error calling multiple methods:", error);
    throw error;
  }
};

export const executeCall = async <T extends Interface>({
  contractAddress,
  contractInterface,
  args,
  method,
  callOptions,
}: {
  contractAddress: string;
  contractInterface: T;
  method: MethodName<T["getFunction"]>;
  args: unknown[];
  callOptions?: ContractCallOptions;
}) => {
  try {
    const interfaceJson = contractInterface.getFunction(method)?.format("full");
    if (!interfaceJson) throw new Error(`Method ${method} not found`);
    const functionAbi = new ABIFunction(interfaceJson) as any; //TODO: Fix type casting
    const results = await thorClient.contracts.executeCall(contractAddress, functionAbi, args, callOptions);
    return results;
  } catch (error) {
    console.error("Error calling multiple methods:", error);
    throw error;
  }
};
