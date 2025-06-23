import { IpfsDetails } from "@/types/ipfs";
import { getProposalsFromIpfs } from "@/utils/ipfs/proposal";
import { mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents, getProposalsWithState } from "@/utils/proposals/proposalsQueries";
import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";

const getProposals = async (thor: Connex.Thor) => {
  const data = await getProposalsEvents(thor);
  const proposals = data?.proposals || [];

  const ipfsFetches = proposals.map(p => getProposalsFromIpfs(p.ipfsHash));
  const ipfsDetails: IpfsDetails[] = await Promise.all(ipfsFetches);

  const merged = mergeIpfsDetails(ipfsDetails, proposals);
  return await getProposalsWithState(merged);
};

export const useProposalsEvents = () => {
  const { thor } = useConnex();

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
