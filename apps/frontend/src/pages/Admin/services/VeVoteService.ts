/* eslint-disable @typescript-eslint/no-explicit-any */
import { VeVote__factory } from "@repo/contracts";
import { getConfig } from "@repo/config";
import { executeCall, executeMultipleClauses } from "../../../utils/contract";
import { ZERO_ADDRESS } from "@vechain/sdk-core";
import { getAllEventLogs, ThorClient } from "@vechain/vechain-kit";
import { VALIDATOR_STAKED_VET_REQUIREMENT } from "@/constants";
import { StargateLevelRow } from "../components/Contracts/components/StargateLevelDetails";

export interface VeVoteInfo {
  quorumNumerator: bigint;
  quorumDenominator: bigint;
  minVotingDelay: number;
  minVotingDuration: number;
  maxVotingDuration: number;
  minStakedAmount: bigint;
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

export interface RoleUserInfo {
  address: string;
  grantedAt: Date;
  transactionId: string;
  isCurrentlyGranted: boolean;
  lastActionAt: Date;
}

export class VeVoteService {
  private readonly contractAddress: string;
  private readonly contractInterface: VevoteContractInterface;
  private readonly nodeUrl: string;

  constructor() {
    const config = getConfig(import.meta.env.VITE_APP_ENV);
    this.contractAddress = config.vevoteContractAddress;
    this.contractInterface = VeVote__factory.createInterface();
    this.nodeUrl = config.nodeUrl;
  }

  async getVeVoteInfo(): Promise<VeVoteInfo> {
    const methodsWithArgs = [
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

    const quorumNumerator = await this.getQuorumNumerator();

    return {
      quorumNumerator,
      quorumDenominator: BigInt(results[0]?.success ? String(results[0].result.plain) : "0"),
      minVotingDelay: Number(results[1]?.success ? results[1].result.plain : 0),
      minVotingDuration: Number(results[2]?.success ? results[2].result.plain : 0),
      maxVotingDuration: Number(results[3]?.success ? results[3].result.plain : 0),
      minStakedAmount: BigInt(results[4]?.success ? String(results[4].result.plain) : "0"),
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

  async getQuorumNumerator(): Promise<bigint> {
    try {
      const result = await executeCall({
        contractAddress: this.contractAddress,
        contractInterface: this.contractInterface,
        method: "quorumNumerator()" as const,
        args: [],
      });
      return result?.success ? BigInt(result.result.plain as string) : BigInt(0);
    } catch (error) {
      console.error("Error fetching quorum numerator:", error);
      return BigInt(0);
    }
  }

  async getLevelMultipliers(): Promise<number[]> {
    const DEFAULT_MULTIPLIERS = [200, 100, 100, 100, 150, 150, 150, 150, 100, 100, 100];
    const methodsWithArgs = Array.from({ length: 11 }, (_, index) => ({
      method: "levelIdMultiplier" as const,
      args: [index],
    }));

    try {
      const results = await executeMultipleClauses({
        contractAddress: this.contractAddress,
        contractInterface: this.contractInterface,
        methodsWithArgs,
      });

      return results.map(result => (result?.success ? Number(result.result.plain) : 100)) || DEFAULT_MULTIPLIERS;
    } catch (error) {
      console.error("Error fetching level multipliers:", error);
      return DEFAULT_MULTIPLIERS;
    }
  }

  async getVotingPowerAtTimepoint(address: string, timepoint: number, masterAddress?: string): Promise<bigint> {
    try {
      const result = await executeMultipleClauses({
        contractAddress: this.contractAddress,
        contractInterface: this.contractInterface,
        methodsWithArgs: [
          {
            method: "getVoteWeightAtTimepoint" as const,
            args: [address, timepoint, masterAddress || ZERO_ADDRESS],
          },
        ],
      });

      return result[0]?.success ? BigInt(result[0].result.plain as string) : BigInt(0);
    } catch (error) {
      console.error("Error fetching voting power at timepoint:", error);
      return BigInt(0);
    }
  }

  getValidatorInfo(): StargateLevelRow {
    return {
      name: "Validator",
      vetAmountRequiredToStake: VALIDATOR_STAKED_VET_REQUIREMENT,
      levelId: 0,
      maturityBlocks: BigInt(0),
    };
  }

  async getRoleUsers(thor: ThorClient, roleHash: string): Promise<RoleUserInfo[]> {
    if (!thor) {
      return [];
    }

    try {
      const roleGrantedAbi = thor.contracts.load(this.contractAddress, VeVote__factory.abi).getEventAbi("RoleGranted");
      const roleRevokedAbi = thor.contracts.load(this.contractAddress, VeVote__factory.abi).getEventAbi("RoleRevoked");

      const filterCriteria = [
        {
          criteria: {
            address: this.contractAddress,
            topic0: roleGrantedAbi.signatureHash,
            topic1: roleHash,
          },
          eventAbi: roleGrantedAbi,
        },
        {
          criteria: {
            address: this.contractAddress,
            topic0: roleRevokedAbi.signatureHash,
            topic1: roleHash,
          },
          eventAbi: roleRevokedAbi,
        },
      ];

      const allEvents = await getAllEventLogs({ thor, nodeUrl: this.nodeUrl, filterCriteria });

      const userEventsMap = new Map<
        string,
        Array<{
          type: "granted" | "revoked";
          timestamp: number;
          blockNumber: number;
          transactionId: string;
          grantedAt?: Date;
        }>
      >();

      allEvents.forEach(event => {
        if (event.decodedData) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_role, account, _sender] = event.decodedData as [string, string, string];

          if (!userEventsMap.has(account)) {
            userEventsMap.set(account, []);
          }

          const eventType = event.topics[0] === roleGrantedAbi.signatureHash ? "granted" : "revoked";

          userEventsMap.get(account)!.push({
            type: eventType,
            timestamp: event.meta.blockTimestamp,
            blockNumber: event.meta.blockNumber,
            transactionId: event.meta.txID,
            grantedAt: eventType === "granted" ? new Date(event.meta.blockTimestamp * 1000) : undefined,
          });
        }
      });

      const currentUsers: RoleUserInfo[] = [];

      userEventsMap.forEach((events, address) => {
        events.sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) {
            return a.blockNumber - b.blockNumber;
          }
          return a.timestamp - b.timestamp;
        });

        const lastEvent = events[events.length - 1];

        if (lastEvent.type === "granted") {
          const currentGrantEvent = lastEvent;

          currentUsers.push({
            address,
            grantedAt: new Date(currentGrantEvent.timestamp * 1000),
            transactionId: currentGrantEvent.transactionId,
            isCurrentlyGranted: true,
            lastActionAt: new Date(lastEvent.timestamp * 1000),
          });
        }
      });

      return currentUsers.sort((a, b) => b.lastActionAt.getTime() - a.lastActionAt.getTime());
    } catch (error) {
      console.error("Error fetching role users:", error);
      return [];
    }
  }
}

export const veVoteService = new VeVoteService();
