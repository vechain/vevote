import { MethodName } from "@/types/common";
import { Interface } from "ethers";
import { abi } from "thor-devkit";
import { ABIFunction } from "@vechain/sdk-core";
import { thorClient } from "./thorClient";
import { ContractCallOptions, SimulateTransactionOptions } from "@vechain/sdk-network";

export type GetMethodProps<T extends Interface> = {
  contractInterface: T;
  methods: MethodName<T["getEvent"]>[];
};

export const getEventMethods = <T extends Interface>({ contractInterface, methods }: GetMethodProps<T>) => {
  try {
    return methods.map(method => {
      const contractAbi = contractInterface.getEvent(method);
      if (!contractAbi) throw new Error(`${method} event not found`);
      return new abi.Event(contractAbi as unknown as abi.Event.Definition);
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const buildFilterCriteria = ({
  contractAddress,
  events,
  proposalId,
}: {
  contractAddress: string;
  events: abi.Event[];
  proposalId?: string;
}) => {
  return events.map(ev => {
    const topics = ev.encode({ proposalId });
    return {
      address: contractAddress,
      topic0: ev.signature,
      topic1: topics[1] ?? undefined,
    };
  });
};

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
    const functionAbi = new ABIFunction(interfaceJson);
    const results = await thorClient.contracts.executeCall(contractAddress, functionAbi, args, callOptions);
    return results;
  } catch (error) {
    console.error("Error calling multiple methods:", error);
    throw error;
  }
};
