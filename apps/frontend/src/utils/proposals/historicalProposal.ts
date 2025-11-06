import { HistoricalProposalMerged, HistoricalProposalResponse, MergedProposal } from "@/types/historicalProposals";
import { IndexerRoutes } from "@/types/indexer";
import { getConfig } from "@repo/config";
import axios from "axios";

// Using mainnet config here because historical proposals are empty on testnet
const indexerUrl = getConfig("mainnet").indexerUrl;

export const getHistoricalProposal = async (proposalId?: string) => {
  const isValid = !proposalId || proposalId?.includes("-");
  if (!isValid) return { results: undefined };
  const [contractAddress, id] = proposalId?.split("-") || [undefined, undefined];
  try {
    const res = await axios.get<HistoricalProposalResponse>(`${indexerUrl}${IndexerRoutes.HISTORIC_PROPOSALS}`, {
      params: {
        size: 50,
        contractAddress,
        proposalId: id,
      },
    });

    return { results: res.data.data || [] };
  } catch (error) {
    console.error(`Failed to fetch historical Proposal: ${error}`);
    return { results: undefined };
  }
};

export function isHistoricalProposalMerged(proposal: MergedProposal): proposal is HistoricalProposalMerged {
  return "choicesWithVote" in proposal || "totalVotes" in proposal;
}
