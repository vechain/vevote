import { ProposalCardType } from "@/types/proposal";
import { executeMultipleClauses } from "@/utils/contract";
import { getProposalsFromIpfs } from "@/utils/ipfs/proposal";
import { getStatusFromState, getStatusParProposalMethod, mergeIpfsDetails } from "@/utils/proposals/helpers";
import { getProposalsEvents } from "@/utils/proposals/proposalsEvents";
import { getConfig } from "@repo/config";
import { VeVote__factory } from "@repo/contracts";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/vechain-kit";
import { useMemo } from "react";

const contractAddress = getConfig(import.meta.env.VITE_APP_ENV).vevoteContractAddress;
const contractInterface = VeVote__factory.createInterface();

export const useProposalsEvents = () => {
  const { thor } = useConnex();

  const { data } = useQuery({
    queryKey: ["proposalsEvents"],
    queryFn: async () => await getProposalsEvents(thor),
    enabled: !!thor,
    gcTime: 0,
  });

  const ipfsData = useQueries({
    queries: (data?.proposals || []).map(item => ({
      queryKey: ["item", item.id],
      queryFn: async () => await getProposalsFromIpfs(item.ipfsHash),
      staleTime: 5 * 60 * 1000,
    })),
    combine: results => {
      return results.map(result => result.data || {});
    },
  });

  const proposalsData = useMemo(() => {
    return mergeIpfsDetails(ipfsData, data?.proposals);
  }, [data?.proposals, ipfsData]);

  const { data: proposalsState } = useQuery({
    queryKey: ["proposalsState"],
    queryFn: async () =>
      await executeMultipleClauses({
        contractAddress,
        contractInterface,
        methodsWithArgs: getStatusParProposalMethod(proposalsData?.map(d => d.id || "")),
      }),
    enabled: !!thor && !!proposalsData,
  });

  const proposals = useMemo(() => {
    const parsedProposalState = proposalsState?.map(r => {
      return getStatusFromState(Number(r.result.plain));
    });

    if (!parsedProposalState) return [];

    return (
      (proposalsData?.map((p, i) => ({
        status: parsedProposalState[i],
        ...p,
      })) as ProposalCardType[]) || []
    );
  }, [proposalsData, proposalsState]);

  return { proposals };
};
