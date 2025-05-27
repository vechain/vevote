import { IndexerRoutes } from "@/types/indexer";
import { VotedComments, VotedResult } from "@/types/votes";
import { getConfig } from "@repo/config";
import axios from "axios";

const indexerUrl = getConfig(import.meta.env.VITE_APP_ENV).indexerUrl;

export const getVotedChoices = async (proposalId?: string, voter?: string) => {
  if (!proposalId) return { results: undefined };

  try {
    const res = await axios.get<VotedComments>(`${indexerUrl}${IndexerRoutes.PROPOSAL}`, {
      params: {
        proposalId,
        voter,
        page: 0,
        size: 1,
        direction: "DESC",
      },
    });

    return { results: res.data || [] };
  } catch (error) {
    console.error(`Failed to fetch votes results: ${error}`);
    return { results: undefined };
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
