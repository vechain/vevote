import { IndexerRoutes } from "@/types/indexer";
import { VotedResult } from "@/types/votes";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import axios from "axios";
import { executeCall } from "../contract";
import { getAllEventLogs, ThorClient } from "@vechain/vechain-kit";

const indexerUrl = getConfig(import.meta.env.VITE_APP_ENV).indexerUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();
const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;

type DecodedVoteCastEvent = [string, bigint, 0 | 1 | 2, bigint, string, bigint[], string];

export const getHasVoted = async (proposalId?: string, address?: string) => {
  if (!proposalId || !address) return false;
  if (proposalId === "draft") return false;

  try {
    const hasVoted = await executeCall({
      contractAddress,
      contractInterface,
      method: "hasVoted",
      args: [proposalId, address],
    });

    if (hasVoted.success) {
      return hasVoted.result.plain as boolean;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getVoteCastResults = async (
  thor: ThorClient,
  { address, proposalIds }: { proposalIds?: string[]; address?: string },
) => {
  if (!thor) {
    return { votes: undefined };
  }

  try {
    const eventAbi = thor.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi("VoteCast");

    const topicsArray = proposalIds?.map(p =>
      eventAbi.encodeFilterTopicsNoNull({
        voter: address,
        proposalId: p,
      }),
    );

    const filterCriteria =
      topicsArray?.map(topics => ({
        criteria: {
          address: contractAddress,
          topic0: eventAbi.signatureHash,
          topic1: topics?.[1],
        },
        eventAbi,
      })) || [];

    const events = await getAllEventLogs({ thor, nodeUrl, filterCriteria });

    const votedEvents = events.map(event => {
      const [voter, proposalId, choice, weight, reason, stargateNFTs, validator] =
        event.decodedData as DecodedVoteCastEvent;

      const votes = {
        proposalId: proposalId.toString(),
        voter,
        choice,
        weight: weight.toString(),
        reason,
        stargateNFTs: stargateNFTs.map(nft => nft.toString()),
        validator,
        date: new Date(event.meta.blockTimestamp * 1000),
        transactionId: event.meta.txID,
      };

      return votes;
    });

    return {
      votes: votedEvents,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getIndexerVoteResults = async (proposalId?: string, size?: number, page?: number) => {
  if (!proposalId) return { results: undefined };

  try {
    const res = await axios.get<VotedResult>(`${indexerUrl}${IndexerRoutes.RESULTS}`, {
      params: {
        proposalId,
        page: page || 0,
        size: size || 20,
        direction: "DESC",
      },
    });

    return { results: res.data || [] };
  } catch (error) {
    console.error(`Failed to fetch votes results: ${error}`);
    return { results: undefined };
  }
};
