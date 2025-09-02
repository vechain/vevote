import { StargateNFT__factory } from "@repo/contracts/typechain-types";
import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../../../utils/contract";

export interface StargateLevel {
  name: string;
  isX: boolean;
  maturityBlocks: bigint;
  scaledRewardFactor: bigint;
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
  supplies: StargateLevelSupply[];
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
      ...levelIds.map(levelId => ({ method: "getLevelSupply" as const, args: [levelId] })),
    ];

    const results = await executeMultipleClauses({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      methodsWithArgs,
    });

    const totalSupply = BigInt(results[0]?.success ? String(results[0].result.plain) : "0");
    const levels = (results[1]?.success ? results[1].result.plain : []) as StargateLevel[];
    const supplies = results.slice(2).map(result => {
      if (result?.success && Array.isArray(result.result.plain)) {
        return {
          circulating: BigInt(String(result.result.plain[0] || "0")),
          cap: Number(result.result.plain[1] || 0),
        };
      }
      return { circulating: BigInt("0"), cap: 0 };
    });

    return {
      totalSupply,
      levelIds,
      levels,
      supplies,
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

  async getLevel(levelId: number): Promise<StargateLevel> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getLevel",
      args: [levelId],
    });
    return (result?.success ? result.result.plain : {}) as StargateLevel;
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

  async getTokenLevel(tokenId: bigint): Promise<number> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getTokenLevel",
      args: [tokenId],
    });
    return Number(result?.success ? result.result.plain : 0);
  }

  async getToken(tokenId: bigint): Promise<StargateToken> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getToken",
      args: [tokenId],
    });
    return (result?.success ? result.result.plain : {}) as StargateToken;
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

  async getIdsOwnedBy(owner: string): Promise<bigint[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "idsOwnedBy",
      args: [owner],
    });
    return result?.success && Array.isArray(result.result.plain)
      ? result.result.plain.map((id: unknown) => BigInt(String(id)))
      : [];
  }

  async tokenExists(tokenId: bigint): Promise<boolean> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "tokenExists",
      args: [tokenId],
    });
    return Boolean(result?.success ? result.result.plain : false);
  }

  async isUnderMaturityPeriod(tokenId: bigint): Promise<boolean> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "isUnderMaturityPeriod",
      args: [tokenId],
    });
    return Boolean(result?.success ? result.result.plain : false);
  }

  async canTransfer(tokenId: bigint): Promise<boolean> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "canTransfer",
      args: [tokenId],
    });
    return Boolean(result?.success ? result.result.plain : false);
  }

  async maturityPeriodEndBlock(tokenId: bigint): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "maturityPeriodEndBlock",
      args: [tokenId],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async claimableVetGeneratedVtho(tokenId: bigint): Promise<bigint> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "claimableVetGeneratedVtho",
      args: [tokenId],
    });
    return BigInt(result?.success ? String(result.result.plain) : "0");
  }

  async getLevelsCirculatingSuppliesAtBlock(blockNumber: bigint): Promise<bigint[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getLevelsCirculatingSuppliesAtBlock",
      args: [blockNumber],
    });
    return result?.success && Array.isArray(result.result.plain)
      ? result.result.plain.map((supply: unknown) => BigInt(String(supply)))
      : [];
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

export const stargateService = new StargateService();
