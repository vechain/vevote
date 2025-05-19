import { getProposalsFromIpfs, getProposalsWithState } from "@/utils/ipfs/proposal";
import { mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents } from "@/utils/proposals/proposalsEvents";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";
import { useMemo } from "react";

export const useProposalsEvents = () => {
  const { thor } = useConnex();

  //proposals from events
  const { data, isFetching } = useQuery({
    queryKey: ["proposalsEvents"],
    queryFn: async () => await getProposalsEvents(thor),
    enabled: !!thor,
    gcTime: 0,
  });

  //proposals with ipfs data
  const proposalsData = useQueries({
    queries: (data?.proposals || []).map(item => ({
      queryKey: ["item", item.id],
      queryFn: async () => await getProposalsFromIpfs(item.ipfsHash),
      staleTime: 5 * 60 * 1000,
    })),
    combine: results => {
      return mergeIpfsDetails(
        results.map(result => result.data || {}),
        data?.proposals,
      );
    },
  });

  //final proposals with status
  const { data: proposals, isFetching: isFinalFetching } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => await getProposalsWithState(proposalsData),
    enabled: !!thor && !!proposalsData,
  });

  const loading = useMemo(() => isFinalFetching || isFetching, [isFetching, isFinalFetching]);

  return { proposals: proposals || [], loading };
};
