/* eslint-disable @typescript-eslint/no-explicit-any */
import { VeVote__factory } from "@repo/contracts";
import { getConfig } from "@repo/config";
import { executeMultipleClauses } from "../../../utils/contract";

export interface VeVoteInfo {
  quorumNumerator: bigint;
  quorumDenominator: bigint;
  minVotingDelay: number;
  minVotingDuration: number;
  maxVotingDuration: number;
  version: bigint;
}

export interface ContractAddresses {
  vevoteContractAddress: string;
  nodeManagementAddress: string;
  stargateAddress: string;
}

type VevoteContractInterface = ReturnType<typeof VeVote__factory.createInterface>;

export interface VotingMultipliers {
  [levelId: number]: bigint;
}

export class VeVoteService {
  private readonly contractAddress: string;
  private readonly contractInterface: VevoteContractInterface;

  constructor() {
    const config = getConfig(import.meta.env.VITE_APP_ENV);
    this.contractAddress = config.vevoteContractAddress;
    this.contractInterface = VeVote__factory.createInterface();
  }

  async getVeVoteInfo(): Promise<VeVoteInfo> {
    const methodsWithArgs = [
      { method: "quorumNumerator" as any, args: [] },
      { method: "quorumDenominator" as const, args: [] },
      { method: "getMinVotingDelay" as const, args: [] },
      { method: "getMinVotingDuration" as const, args: [] },
      { method: "getMaxVotingDuration" as const, args: [] },
      { method: "version" as const, args: [] },
    ];

    const results = await executeMultipleClauses({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      methodsWithArgs,
    });

    return {
      quorumNumerator: BigInt(results[0]?.success ? String(results[0].result.plain) : "0"),
      quorumDenominator: BigInt(results[1]?.success ? String(results[1].result.plain) : "0"),
      minVotingDelay: Number(results[2]?.success ? results[2].result.plain : 0) * 10,
      minVotingDuration: Number(results[3]?.success ? results[3].result.plain : 0) * 10,
      maxVotingDuration: Number(results[4]?.success ? results[4].result.plain : 0) * 10,
      version: BigInt(results[5]?.success ? String(results[5].result.plain) : "0"),
    };
  }

  async getContractAddress(): Promise<ContractAddresses> {
    const methodsWithArgs = [
      { method: "getNodeManagementContract" as const, args: [] },
      { method: "getStargateNFTContract" as const, args: [] },
    ];

    try {
      const results = await executeMultipleClauses({
        contractAddress: this.contractAddress,
        contractInterface: this.contractInterface,
        methodsWithArgs,
      });

      return {
        vevoteContractAddress: this.contractAddress,
        nodeManagementAddress: results[0]?.success ? String(results[0].result.plain) : "",
        stargateAddress: results[1]?.success ? String(results[1].result.plain) : "",
      };
    } catch (error) {
      console.error("Error fetching contract addresses:", error);
      throw error;
    }
  }
}

export const veVoteService = new VeVoteService();
