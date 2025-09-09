import { HistoricalProposalResponse } from "@/types/historicalProposals";
import axios from "axios";

export const getHistoricalProposal = async (proposalId?: string) => {
  try {
    const res = await axios.get<HistoricalProposalResponse>(
      `https://indexer.mainnet.vechain.org/api/v1/vevote/historical_proposals`,
      {
        params: {
          size: 50,
          proposalId,
        },
      },
    );

    return { results: res.data.data || [] };
  } catch (error) {
    console.error(`Failed to fetch historical Proposal: ${error}`);
    return { results: undefined };
  }
};
