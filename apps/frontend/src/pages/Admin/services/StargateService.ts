import { StargateNFT__factory } from "@repo/contracts/typechain-types";
import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../../../utils/contract";

export interface StargateLevel {
  name: string;
  maturityBlocks: bigint;
  vetAmountRequiredToStake: bigint;
}

export interface StargateLevelSupply {
  circulating: bigint;
  cap: number;
}

export interface StargateToken {
  tokenId: bigint;
  owner: string;
  levelId: number;
  mintTimestamp: bigint;
}

export interface StargateStats {
  totalSupply: bigint;
  levelIds: number[];
  levels: StargateLevel[];
}

export class StargateService {
  private readonly contractAddress: string;
  private readonly contractInterface: ReturnType<typeof StargateNFT__factory.createInterface>;

  constructor() {
    const config = getConfig(import.meta.env.VITE_APP_ENV);
    this.contractAddress = config.stargateNFTContractAddress;
    this.contractInterface = StargateNFT__factory.createInterface();
  }

  async getStargateStats(): Promise<StargateStats> {
    const levelIds = await this.getLevelIds();

    const methodsWithArgs = [
      { method: "totalSupply" as const, args: [] },
      { method: "getLevels" as const, args: [] },
    ];

    const results = await executeMultipleClauses({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      methodsWithArgs,
    });

    const totalSupply = BigInt(results[0]?.success ? String(results[0].result.plain) : "0");
    const levels = (results[1]?.success ? results[1].result.plain : []) as StargateLevel[];

    return {
      totalSupply,
      levelIds,
      levels,
    };
  }

  async getLevelIds(): Promise<number[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getLevelIds",
      args: [],
    });
    return result?.success && Array.isArray(result.result.plain)
      ? result.result.plain.map((id: unknown) => Number(id))
      : [];
  }

  async getLevels(): Promise<StargateLevel[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getLevels",
      args: [],
    });
    return result?.success && Array.isArray(result.result.plain) ? result.result.plain : [];
  }

  async getLevelSupply(levelId: number): Promise<StargateLevelSupply> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getLevelSupply",
      args: [levelId],
    });
    if (result?.success && Array.isArray(result.result.plain)) {
      return {
        circulating: BigInt(String(result.result.plain[0] || "0")),
        cap: Number(result.result.plain[1] || 0),
      };
    }
    return { circulating: BigInt("0"), cap: 0 };
  }

  async getTotalSupply(): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "totalSupply",
      args: [],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getTokensOwnedBy(owner: string): Promise<StargateToken[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "tokensOwnedBy",
      args: [owner],
    });
    return result?.success && Array.isArray(result.result.plain) ? result.result.plain : [];
  }
}

export const stargateService = new StargateService();
