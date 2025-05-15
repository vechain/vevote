import { getProposalsFromIpfs, getProposalsWithState } from "@/utils/ipfs/proposal";
import { mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents } from "@/utils/proposals/proposalsEvents";
import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";
import { useMemo } from "react";

export const useProposalEvents = ({ proposalId }: { proposalId?: string }) => {
  const { thor } = useConnex();

  //proposals from events with id
  const { data } = useQuery({
    queryKey: ["proposalsEvents"],
    queryFn: async () => await getProposalsEvents(thor, proposalId),
    enabled: !!thor && !!proposalId,
    gcTime: 0,
  });

  const proposalIpfsHash = useMemo(() => data?.proposals?.[0].ipfsHash || "", [data?.proposals]);

  const { data: proposalData } = useQuery({
    queryKey: ["singleProposal"],
    queryFn: async () => await getProposalsFromIpfs(proposalIpfsHash),
    enabled: !!thor && !!proposalId,
    gcTime: 0,
  });

  //final proposal with status
  const { data: proposals } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => await getProposalsWithState(mergeIpfsDetails([proposalData], data?.proposals)),
    enabled: !!thor && !!proposalData,
  });

  return { proposal: proposals?.[0] };
};
