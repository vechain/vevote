import { IpfsDetails } from "@/types/ipfs";
import { getProposalsFromIpfs } from "@/utils/ipfs/proposal";
import { mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents, getProposalsWithState } from "@/utils/proposals/proposalsQueries";
import { getVoteResults } from "@/utils/proposals/votedQueries";
import { useQuery } from "@tanstack/react-query";
import { ThorClient, useThor } from "@vechain/vechain-kit";

const getProposals = async (thor: ThorClient) => {
  const data = await getProposalsEvents(thor);
  const proposals = data?.proposals || [];

  const { votes } = await getVoteResults(thor, { proposalIds: proposals.map(p => p.id) });

  const ipfsFetches = proposals.map(p => getProposalsFromIpfs(p.ipfsHash));
  const ipfsDetails: IpfsDetails[] = await Promise.all(ipfsFetches);

  const mergedWithIpfs = mergeIpfsDetails(ipfsDetails, proposals);
  const merged = mergedWithIpfs?.map(p => ({
    ...p,
    results: votes?.filter(v => v.proposalId === p.id),
  }));

  return await getProposalsWithState(merged);
};

export const useProposalsEvents = () => {
  const thor = useThor();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ["proposalsEvents"],
    queryFn: async () => await getProposals(thor),
    enabled: !!thor,
  });

  return {
    proposals: proposals || [],
    loading: isLoading,
  };
};
