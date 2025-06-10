import { getProposalsFromIpfs } from "@/utils/ipfs/proposal";
import { mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents, getProposalsWithState } from "@/utils/proposals/proposalsQueries";
import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";

const getSingleProposal = async (thor: Connex.Thor, proposalId?: string) => {
  const data = await getProposalsEvents(thor, proposalId);
  console.log("getSingleProposal data", data);
  const proposalData = await getProposalsFromIpfs(data?.proposals?.[0].ipfsHash);
  return await getProposalsWithState(mergeIpfsDetails([proposalData], data?.proposals));
};

export const useProposalEvents = ({ proposalId }: { proposalId?: string }) => {
  const { thor } = useConnex();

  const { data, error, isLoading } = useQuery({
    queryKey: ["getSingleProposal", proposalId],
    queryFn: async () => await getSingleProposal(thor, proposalId),
    enabled: !!thor && !!proposalId,
  });

  return { proposal: data?.[0], error, isLoading };
};
