import { IndexerRoutes } from "@/types/indexer";
import { VotedChoices, VotedResult } from "@/types/votes";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import axios from "axios";
import { executeCall } from "../contract";
import { getAllEventLogs, ThorClient } from "@vechain/vechain-kit";

const indexerUrl = getConfig(import.meta.env.VITE_APP_ENV).indexerUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();
const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;

type DecodedVoteCastEvent = [bigint, string, bigint];

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

export const getVotedChoices = async (thor: ThorClient, proposalId?: string, address?: string) => {
  if (!proposalId || !address) return { votedChoices: undefined };

  try {
    const eventAbi = thor.contracts.load(contractAddress, VeVote__factory.abi).getEventAbi("VoteCast");

    const topics = eventAbi.encodeFilterTopicsNoNull({
      address,
      proposalId,
    });

    const filterCriteria = [
      {
        criteria: {
          address: contractAddress,
          topic0: eventAbi.signatureHash,
          topic1: topics[1] ?? undefined,
          topic2: topics[2] ?? undefined,
        },
        eventAbi,
      },
    ];

    const events = await getAllEventLogs({ thor, nodeUrl, filterCriteria });

    const votedEvents = events.map(event => {
      const [proposalId, voter, choices] = event.decodedData as DecodedVoteCastEvent;

      const votedChoices = {
        proposalId: proposalId.toString(),
        voter,
        choices: Number(choices).toString(2).split("").reverse(),
      };

      return votedChoices;
    });

    return {
      votedChoices: votedEvents.filter(
        event => event.proposalId === proposalId && event.voter === address,
      )[0] as VotedChoices,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getVotesResults = async (proposalId?: string, size?: number, page?: number) => {
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
