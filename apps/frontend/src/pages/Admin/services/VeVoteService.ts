import { VeVote__factory } from "@repo/contracts";
import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../../../utils/contract";

export interface VeVoteInfo {
  quorumNumerator: bigint;
  quorumDenominator: bigint;
  minVotingDelay: bigint;
  minVotingDuration: bigint;
  maxVotingDuration: bigint;
  minStakedAmount: bigint;
  version: bigint;
}

export interface VotingMultipliers {
  [levelId: number]: bigint;
}

export class VeVoteService {
  private readonly contractAddress: string;
  private readonly contractInterface: ReturnType<typeof VeVote__factory.createInterface>;

  constructor() {
    const config = getConfig(import.meta.env.VITE_APP_ENV);
    this.contractAddress = config.vevoteContractAddress;
    this.contractInterface = VeVote__factory.createInterface();
  }

  async getVeVoteInfo(): Promise<VeVoteInfo> {
    const methodsWithArgs = [
      // { method: "quorumNumerator" as const, args: [] },
      { method: "quorumDenominator" as const, args: [] },
      { method: "getMinVotingDelay" as const, args: [] },
      { method: "getMinVotingDuration" as const, args: [] },
      { method: "getMaxVotingDuration" as const, args: [] },
      { method: "getMinStakedAmount" as const, args: [] },
      { method: "version" as const, args: [] },
    ];

    const results = await executeMultipleClauses({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      methodsWithArgs,
    });

    return {
      quorumNumerator: BigInt(0), //TODO: fix this
      quorumDenominator: BigInt(results[1]?.success ? String(results[1].result.plain) : "0"),
      minVotingDelay: BigInt(results[2]?.success ? String(results[2].result.plain) : "0"),
      minVotingDuration: BigInt(results[3]?.success ? String(results[3].result.plain) : "0"),
      maxVotingDuration: BigInt(results[4]?.success ? String(results[4].result.plain) : "0"),
      minStakedAmount: BigInt(results[5]?.success ? String(results[5].result.plain) : "0"),
      version: BigInt(results[6]?.success ? String(results[6].result.plain) : "0"),
    };
  }

  async getQuorumNumerator(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "quorumNumerator()",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getQuorumDenominator(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "quorumDenominator",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getMinVotingDelay(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getMinVotingDelay",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getMinVotingDuration(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getMinVotingDuration",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getMaxVotingDuration(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getMaxVotingDuration",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getMinStakedAmount(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getMinStakedAmount",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getLevelIdMultiplier(levelId: number): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "levelIdMultiplier",
      args: [levelId],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getNodeManagementContract(): Promise<string> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getNodeManagementContract",
      args: [],
    });
    return result?.success ? String(result.result.plain) : "";
  }

  async getStargateNFTContract(): Promise<string> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getStargateNFTContract",
      args: [],
    });
    return result?.success ? String(result.result.plain) : "";
  }

  async getValidatorContract(): Promise<string> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getValidatorContract",
      args: [],
    });
    return result?.success ? String(result.result.plain) : "";
  }

  async getVersion(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "version",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }
}

// Singleton instance
export const veVoteService = new VeVoteService();
