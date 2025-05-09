import { MethodName } from "@/types/common";
import { getConfig } from "@repo/config";
import { ThorClient } from "@vechain/sdk-network";
import { Interface } from "ethers";
import { abi } from "thor-devkit";
import { ABIFunction } from "@vechain/sdk-core";

const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;

export type GetMethodProps<T extends Interface> = {
  contractInterface: T;
  methods: MethodName<T["getEvent"]>[]; // The method name
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

export const buildFilterCriteria = ({ contractAddress, events }: { contractAddress: string; events: abi.Event[] }) => {
  return events.map(ev => {
    return {
      address: contractAddress,
      topic0: ev.signature,
    };
  });
};

export const executeMultipleClauses = async <T extends Interface>({
  contractAddress,
  contractInterface,
  methodsWithArgs,
}: {
  contractAddress: string;
  contractInterface: T;
  methodsWithArgs?: { method: MethodName<T["getFunction"]>; args: unknown[] }[];
}) => {
  const thor = ThorClient.at(nodeUrl);

  try {
    const clauses = methodsWithArgs?.map(({ method, args }) => {
      const interfaceJson = contractInterface.getFunction(method)?.format("full");
      if (!interfaceJson) throw new Error(`Method ${method} not found`);

      const functionAbi = new ABIFunction(interfaceJson);
      return thor.contracts.load(contractAddress, [functionAbi.signature]).clause[method](...args);
    });

    if (!clauses) throw new Error(`Clauses not found`);

    const results = await thor.contracts.executeMultipleClausesCall(clauses);

    return results;
  } catch (error) {
    console.error("Error calling multiple methods:", error);
    throw error;
  }
};
