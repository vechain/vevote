import { StargateNFT__factory } from "@vechain/vevote-contracts/typechain-types";
import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../../../utils/contract";

export interface NodeStats {
  totalNodes: number;
  delegatedNodes: number;
  levelDistribution: { [level: number]: number };
}

export interface UserNodeInfo {
  ownedNodes: bigint[];
  managedNodes: bigint[];
  isNodeHolder: boolean;
  isNodeDelegator: boolean;
}

export class NodeManagementService {
  private readonly contractAddress: string;
  private readonly contractInterface: ReturnType<typeof StargateNFT__factory.createInterface>;

  constructor() {
    const config = getConfig(import.meta.env.VITE_APP_ENV);
    this.contractAddress = config.stargateNFTContractAddress;
    this.contractInterface = StargateNFT__factory.createInterface();
  }

  async getUserNodeInfo(userAddress: string): Promise<UserNodeInfo> {
    const methodsWithArgs = [
      { method: "idsOwnedBy" as const, args: [userAddress] },
      { method: "idsManagedBy" as const, args: [userAddress] },
    ];

    const results = await executeMultipleClauses({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      methodsWithArgs,
    });

    return {
      ownedNodes:
        results[0]?.success && Array.isArray(results[0].result.plain)
          ? results[0].result.plain.map((id: unknown) => BigInt(String(id)))
          : [],
      managedNodes:
        results[1]?.success && Array.isArray(results[1].result.plain)
          ? results[1].result.plain.map((id: unknown) => BigInt(String(id)))
          : [],
      isNodeHolder: Boolean(results[0]?.success ? results[0].result.plain : false),
      isNodeDelegator: Boolean(results[1]?.success ? results[1].result.plain : false),
    };
  }

  async getNodeLevel(nodeId: bigint): Promise<number> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "getTokenLevel",
      args: [nodeId],
    });
    return result?.success ? Number(result.result.plain) : 0;
  }

  async isNodeHolder(userAddress: string): Promise<boolean> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "isTokenManager",
      args: [userAddress],
    });
    return Boolean(result?.success ? result.result.plain : false);
  }

  async isNodeDelegator(userAddress: string): Promise<boolean> {
    const methodsWithArgs = [
      { method: "idsOwnedBy" as const, args: [userAddress] },
      { method: "idsManagedBy" as const, args: [userAddress] },
    ];

    const results = await executeMultipleClauses({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      methodsWithArgs,
    });

    const ownedNodes =
      results[0]?.success && Array.isArray(results[0].result.plain)
        ? results[0].result.plain.map((id: unknown) => BigInt(String(id)))
        : [];
    const managedNodes =
      results[1]?.success && Array.isArray(results[1].result.plain)
        ? results[1].result.plain.map((id: unknown) => BigInt(String(id)))
        : [];

    if (ownedNodes.length === 0) {
      return false;
    }

    const managedSet = new Set(managedNodes.map(id => id.toString()));
    return ownedNodes.some(id => !managedSet.has(id.toString()));
  }

  async getDirectNodesOwnership(userAddress: string): Promise<bigint[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "idsOwnedBy",
      args: [userAddress],
    });
    return result?.success && Array.isArray(result.result.plain)
      ? result.result.plain.map((id: unknown) => BigInt(String(id)))
      : [];
  }

  async getNodeIds(userAddress: string): Promise<bigint[]> {
    const result = await executeCall({
      contractAddress: this.contractAddress,
      contractInterface: this.contractInterface,
      method: "idsManagedBy",
      args: [userAddress],
    });
    return result?.success && Array.isArray(result.result.plain)
      ? result.result.plain.map((id: unknown) => BigInt(String(id)))
      : [];
  }
}

export const nodeManagementService = new NodeManagementService();
