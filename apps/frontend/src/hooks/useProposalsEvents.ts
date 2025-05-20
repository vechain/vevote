import { IpfsDetails } from "@/types/ipfs";
import { getProposalsFromIpfs, getProposalsWithState } from "@/utils/ipfs/proposal";
import { mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents } from "@/utils/proposals/proposalsEvents";
import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";

const getProposals = async (thor: Connex.Thor) => {
  const data = await getProposalsEvents(thor);
  console.log(data);
  const proposals = data?.proposals;
  const mergedData: IpfsDetails[] = [];

  for (let i = 0; i < proposals.length; i++) {
    const element = await getProposalsFromIpfs(proposals[i].ipfsHash);
    mergedData.push(element);
  }

  return await getProposalsWithState(mergeIpfsDetails(mergedData, proposals));
};

export const useProposalsEvents = () => {
  const { thor } = useConnex();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ["proposalsEvents"],
    queryFn: async () => await getProposals(thor),
    enabled: !!thor,
  });

  return { proposals: proposals || [], loading: isLoading };
};
