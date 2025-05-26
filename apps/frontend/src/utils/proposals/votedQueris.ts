import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { executeCall, getEventMethods } from "../contract";
import { getAllEvents } from "@vechain/vechain-kit";
import { leftPadWithZeros } from "../address";
import { HexUInt } from "@vechain/sdk-core";
import axios from "axios";
import { VotedChoices, VotedResult } from "@/types/votes";

const indexerUrl = getConfig(import.meta.env.VITE_APP_ENV).indexerUrl;
const nodeUrl = getConfig(import.meta.env.VITE_APP_ENV).nodeUrl;
const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const getHasVoted = async (proposalId: string, address?: string) => {
  if (!proposalId || !address) return false;
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

export const getVotedChoices = async (thor: Connex.Thor, proposalId?: string, address?: string) => {
  if (!proposalId || !address) return { votedChoices: undefined };

  try {
    const [voteCastEvent] = getEventMethods({
      contractInterface,
      methods: ["VoteCast"],
    });

    const hexString = BigInt(proposalId).toString(16);
    const filterCriteria = [
      {
        address: contractAddress,
        topic0: voteCastEvent.signature,
        topic1: leftPadWithZeros(address, 64),
      },
      {
        address: contractAddress,
        topic0: voteCastEvent.signature,
        topic2: HexUInt.of("0x0" + hexString).toString(),
      },
    ];

    const events: Connex.Thor.Filter.Row<"event", object>[] = await getAllEvents({ thor, nodeUrl, filterCriteria });
    //TODO: use sdk once vechain-kit is compatible
    // const events = subscriptions.getEventSubscriptionUrl(nodeUrl)

    const decodedProposalEvents = events.map(event => {
      switch (event.topics[0]) {
        case voteCastEvent.signature: {
          const decoded = voteCastEvent.decode(event.data, event.topics);

          const votedChoices = {
            proposalId: decoded.proposalId as string,
            voter: decoded.voter as string,
            choices: Number(decoded.choices).toString(2).split("").reverse(),
          };

          return votedChoices;
        }

        default: {
          throw new Error("Unknown event");
        }
      }
    });

    return {
      votedChoices: decodedProposalEvents.filter(
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
    const res = await axios.get<VotedResult>(`${indexerUrl}/vevote/proposal/results`, {
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
